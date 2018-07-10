# datashare-client

[![Circle CI](https://circleci.com/gh/ICIJ/datashare-client.png?style=shield&circle-token=bb83a70d5a43a31c6fd38d797f015b9419c15ffe)](https://circleci.com/gh/ICIJ/datashare-client)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9090
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## How to run with datashare backend locally

Datashare backend allows to index, find names and provide file preview or download. It can be run alongside the dev frontend for manual testing with the benefits of hot reloading with `npm run dev`.

You have to either run the backend docker container, or the java code if you are willing to modify the backend code.

There are three parameters to use when using the backend in dev mode : 

- run the web server with `-w`
- allow Cross Origin requests (from the front to the back) with `--cors <pattern>`
- points to the data directory (where the source files are located, the directory must be called `data`) with `-d`

### with docker

You can just use the [datashare.sh](https://github.com/ICIJ/datashare/blob/master/datashare-dist/src/main/datashare.sh) script that will download and launch the services used by datashare (i.e. redis and elasticsearch) :

```
$ cd where/is/your/data
$ /path/to/datashare.sh -w --cors '*'
```

Then the script will ask you where your data is, you can just type enter as by default it is the current directory. And when the NLP models should be stored.

### with java code

There is a shell script [launchBack.sh](https://github.com/ICIJ/datashare/blob/master/launchBack.sh) at the root of the datashare backend repository.

After having compiled java code, you can launch the script with :

```
$ ./launchBack -w -d /path/to/data
```

- ***NOTE 1*** : `/path/to/data` must end with `data`
- ***NOTE 2*** : the `--cors` is already set in the shell script 
