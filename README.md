# SFTP uploader plugin for webpack

[![npm][npm-image]][npm-url]
[![GitHub last commit (branch)][last-commit-image]](#)

[npm-url]: https://www.npmjs.com/package/sftp-uploader-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/sftp-uploader-webpack-plugin.svg?label=npm%20version
[last-commit-image]: https://img.shields.io/github/last-commit/xTCry/sftp-uploader-webpack-plugin/master

A webpack plugin to upload your build folder(s) to server by sftp.

> NOTE: Node v12+ and webpack v4+ are supported.

## Installation

`npm i -D sftp-uploader-webpack-plugin`

or

`yarn add -D sftp-uploader-webpack-plugin`

## Usage

Webpack configuration `webpack.config.ts`

```javascript
// import SftpUploader from 'sftp-uploader-webpack-plugin';
const SftpUploader = require('sftp-uploader-webpack-plugin');
// ...

const webpackConfig = {
  // ...
  plugins: [
    // ...
    ...(!process.env.SFTP_REMOTE_HOST
      ? []
      : [
          new SftpUploader({
            // ssh options
            scp: {
              host: process.env.SFTP_REMOTE_HOST,
              ...(process.env.SFTP_REMOTE_PORT && { port: +process.env.SFTP_REMOTE_PORT }),
              username: process.env.SFTP_REMOTE_USER,
              password: process.env.SFTP_REMOTE_PASSWORD,
              // ... other `ssh2` options
            },
            remotePath: process.env.SFTP_REMOTE_PATH/* ! */,
            // localPath: path.resolve(__dirname, 'dist'),
          }),
        ]),
  ],
}
module.exports = webpackConfig;
```

Example `.env`

```bash
# SFTP
SFTP_REMOTE_HOST=localhost
SFTP_REMOTE_PORT=22
SFTP_REMOTE_USER=user
SFTP_REMOTE_PASSWORD=password
SFTP_REMOTE_PATH=/var/www/prod
```
