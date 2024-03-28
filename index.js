const fs = require("fs");
const { parse } = require("csv-parse");
const axios = require("axios");
const async = require("async");
const path = require("path");
const stringify = require("json-stringify-safe");

const csvData = [];
const BATCH_SIZE = 100;
const CONCURRENCY_LIMIT = 50;

fs.createReadStream("./posts.csv")
  .pipe(
    parse({
      delimiter: ",",
      columns: true,
      ltrim: true,
    })
  )
  .on("data", function (row) {
    // This will push the object row into the array
    csvData.push(row);
  })
  .on("error", function (error) {
    console.log("fileReadError", error.message);
  })
  .on("end", function () {
    processCSVData();
  });

function processCSVData() {
  console.log("processCSVData-----");
  makeConcurrentBatchApiCalls({
    payloads: csvData,
    batchSize: BATCH_SIZE,
    concurrencyLimit: CONCURRENCY_LIMIT,
    callback: (err, results) => {
      if (err) {
        console.error("Error making batch API calls:", err);
        fs.writeFileSync(
          path.join(__dirname, "error.json"),
          stringify(err, null, 2),
          "utf-8"
        );
      } else {
        const resultStringify = stringify(results, null, 2);
        console.log("Batch API calls results:", resultStringify);
        fs.writeFileSync(
          path.join(__dirname, "success.json"),
          resultStringify,
          "utf-8"
        );
      }
    },
  });
}

const performAPICall = async ({ method, url, data }) => {
  console.log("performAPICall--------");
  console.log(stringify({ data }));
  try {
    const response = await axios({ method, url, data });
    return response.data;
  } catch (error) {
    console.error("performAPICall error", error);
    throw error;
  }
};

const performBatchAPICalls = async (batch = []) => {
  console.log("performBatchAPICalls--------");
  try {
    // Make API calls for each payload in the batch concurrently
    const responses = await Promise.allSettled(
      batch.map((data) =>
        performAPICall({
          method: "POST",
          url: "https://jsonplaceholder.typicode.com/posts",
          data: {
            userId: data.userId,
            title: data.title,
            body: data.body,
          },
        })
      )
    );

    return responses;
  } catch (error) {
    console.error("Error processing batch:", error);
    throw error;
  }
};

async function makeConcurrentBatchApiCalls(params = {}) {
  console.log("makeConcurrentBatchApiCalls-----");

  const { payloads, batchSize, concurrencyLimit, callback } = params;
  const batches = [];

  for (let i = 0; i < payloads.length; i += batchSize) {
    batches.push(payloads.slice(i, i + batchSize));
  }

  await async.mapLimit(
    batches,
    concurrencyLimit,
    async (batch) => await performBatchAPICalls(batch),
    (err, result) => {
      if (err) {
        console.error("Error processing batches:", err);
        callback(err);
      } else {
        console.log("All batches processed successfully");
        callback(null, result);
      }
    }
  );
}
