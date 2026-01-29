<p align="center">
<a href="https://datashare.icij.org/">
  <img src="https://datashare.icij.org/android-chrome-512x512.png" width="158px">
</a>
<br>
Web Client for Datashare
</p>

<div align="center">

| | Status |
| --: | :-- |
| **CI checks** | [![Github Actions](https://img.shields.io/github/actions/workflow/status/icij/datashare-client/main.yml?style=shield)](https://github.com/ICIJ/datashare-client/actions/workflows/main.yml) |
| **Latest version** | [![Latest version](https://img.shields.io/github/v/tag/icij/datashare-client?style=shield)](https://github.com/ICIJ/datashare-client/releases/latest) |
| **Release date** | [![Release date](https://img.shields.io/github/release-date/icij/datashare-client?style=shield)](https://github.com/ICIJ/datashare-client/releases/latest) |
| **Open issues** | [![Open issues](https://img.shields.io/github/issues/icij/datashare?style=shield&color=success)](https://github.com/ICIJ/datashare/issues/) |
| **Documentation** | [![Storybook](https://img.shields.io/badge/Storybook-FA4070)](https://icij.github.io/datashare-client/) |

</div>

# Installation guide

## Datashare **Client**

You need [Yarn](https://yarnpkg.com/lang/en/docs/install/) installed on your machine (tested with version 1.22) and Node.js 18 or above (tested with version 18.19).

* Install dependencies:

```
yarn
```

* Serve with hot reload at localhost:9009

```
yarn serve
```

## Datashare **backend**

Datashare backend allows to index, find names and provide file preview or download. It must be run alongside the client for manual testing with the benefits of hot reloading with `yarn serve`.

To run the backend you must:

1. Get and install Datashare from [datashare.icij.org](https://datashare.icij.org/) ;
1. Refer to the [User Guide](https://icij.gitbook.io/datashare/) if you need help installing Datashare ;
2. Run Datashare on port `8080` with CORS: `datashare --tcpListenPort 8080`.


## Build Setup

``` bash
# install / update dependencies
yarn

# serve with hot reload at localhost:9009
yarn serve

# build for production with minification
yarn build

# lint and fix files
yarn lint --fix

# run unit tests
yarn test

# generate documentation
yarn doc
```
