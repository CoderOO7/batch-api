# batch-api

batch-api is the nodejs script to call api's in batch concurrently.

## Getting Started

### Requirement

* VSCode: If you want to take advantage of dev plugins.
* Node >= v16.x.x

> To prevent bugs project is locked to run only on Node v16.0+.
>
> Recommended to use [NVM](https://github.com/creationix/nvm)

### Running Script

Run these commands in terminal.

```bash
$ git clone https://github.com/CoderOO7/batch-api.git
$ cd batch-api
$ npm i
```

And then run this command from root directory.
#### `start script`
```bash
$ node index.js > debug.log
```
It logs your data in `debug.log` file and api's success response in `success.json` and errors in `error.json`
