# Datashare

[![Circle CI](https://circleci.com/gh/ICIJ/datashare-client.png?style=shield&circle-token=bb83a70d5a43a31c6fd38d797f015b9419c15ffe)](https://circleci.com/gh/ICIJ/datashare-client)

## Download

https://datashare.icij.org/


## Documentation

Datashare's user guide can be found here: https://icij.gitbook.io/datashare/


## Backend

This repository is only the frontend part of Datashare.

Please find the backend here : https://github.com/ICIJ/datashare.


## Requirements

You need [Yarn](https://yarnpkg.com/lang/en/docs/install/) installed on your machine (tested with version 1.9.4).

Vue CLI requires Node.js version 8.9 or above (8.11.0+ recommended) [[source](https://cli.vuejs.org/guide/installation.html)].

Tested with Node.js LTS 10.15.2.

## Install

* Install system dependencies for [canvas support](https://github.com/Automattic/node-canvas) in testing environement:

```
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

* Install [Vue CLI](https://cli.vuejs.org/):

```
sudo yarn global add @vue/cli
```

* Install dependencies:

```
yarn
```

* Serve with hot reload at localhost:9009

```
yarn serve
```


## Build Setup

``` bash
# install / update dependencies
yarn

# serve with hot reload at localhost:9009
yarn serve

# build for production with minification
yarn build

# lint and fixe files
yarn lint

# run unit tests serially with jest
make unit

# run e2e tests
yarn test:e2e

# run all tests
yarn test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## How to run with datashare backend locally

Datashare backend allows to index, find names and provide file preview or download. It can be run alongside the dev frontend for manual testing with the benefits of hot reloading with `yarn serve`.

You have to either run the backend docker container, or the java code if you are willing to modify the backend code.

There are three parameters to use when using the backend in dev mode :

- run the web server with `-w`
- allow Cross Origin requests (from the front to the back) with `--cors <pattern>`
- points to the data directory (where the source files are located, the directory must be called `data`) with `-d`

:warning: Caution : In both case, you need to add "elasticsearch" and "redis" as known hosts in your `/etc/hosts` file, on line 127.0.0.1.

`127.0.0.1 localhost elasticsearch redis`


### with docker

You can just use the [datashare.sh](https://github.com/ICIJ/datashare/blob/master/datashare-dist/src/main/datashare.sh) script that will download and launch the services used by datashare (i.e. redis and elasticsearch) :

```
cd where/is/your/data
/path/to/datashare.sh -w --cors '*'
```

Then the script will ask you where your data is, you can just type enter as by default it is the current directory. And when the NLP models should be stored.

### with java code

There is a shell script [launchBack.sh](https://github.com/ICIJ/datashare/blob/master/launchBack.sh) at the root of the datashare backend repository.

After having compiled java code, you can launch the script with :

```
./launchBack -d /path/to/data
```

- ***NOTE 1*** : `/path/to/data` must end with `data`
- ***NOTE 2*** : the `--cors` is already set in the shell script

## Run tests inside [Majestic](https://github.com/Raathigesh/majestic)

Majestic is a "zero config GUI for Jest". First, you need to install it globally:

```
npm install -g majestic
```

Then run Majestic and open [localhost:4000](http://localhost:4000):

```
yarn run test:unit:majestic
```
