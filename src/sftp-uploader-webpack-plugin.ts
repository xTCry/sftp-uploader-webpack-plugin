import { Compiler, Stats } from 'webpack';
import chalk from 'chalk';
import { Client, TScpOptions } from 'node-scp';
// import { TransferOptions } from 'ssh2';

export type Options = {
  /**
   * Config for sftp connection
   */
  scp: TScpOptions;

  // /**
  //  * `ssh2` transfer options
  //  */
  // transferOptions?: TransferOptions;

  /**
   * Write Logs to Console
   *
   * default: false
   */
  verbose?: boolean;

  serverName?: string;

  /**
   * Path on server
   */
  remotePath: string;

  /**
   * Path on build
   *
   * @default `compiler.options.output.path`
   */
  localPath?: string;
};

const PLUGIN_NAME = 'sftp-uploader-webpack-plugin';

export class SftpUploader {
  private scpOptions: TScpOptions;
  // private transferOptions?: TransferOptions;
  private readonly verbose: boolean;
  private readonly serverName?: string;
  private remotePath: string;
  private localPath: string;

  constructor(options: Options) {
    this.scpOptions = options.scp;
    // this.transferOptions = options.transferOptions;
    this.verbose = options.verbose === true || false;
    this.serverName = options.serverName;

    this.remotePath = options.remotePath;
    // this.localPath = '';

    this.apply = this.apply.bind(this);
    this.handleDone = this.handleDone.bind(this);
  }

  apply(compiler: Compiler) {
    if (!compiler.options.output || !compiler.options.output.path) {
      console.warn(PLUGIN_NAME + ': options.output.path not defined. Plugin disabled...');

      return;
    }

    this.localPath ??= compiler.options.output.path;

    /**
     * webpack 4+ comes with a new plugin system.
     *
     * Check for hooks in-order to support old plugin system
     * webpack 5+ removed the old system, the check now breaks
     */
    const hooks = compiler.hooks;

    hooks.done.tap(PLUGIN_NAME, (stats) => {
      this.handleDone(stats);
    });
  }

  handleDone(stats: Stats) {
    /**
     * Do nothing if there is a webpack error
     */
    if (stats.hasErrors()) {
      if (this.verbose) {
        console.warn(PLUGIN_NAME + ': pausing due to webpack errors');
      }

      return;
    }

    let start = Date.now();

    Client(this.scpOptions)
      .then((client) => {
        client
          // .uploadFile(this.localPath, this.remotePath, this.transferOptions)
          .uploadDir(this.localPath, this.remotePath)
          .then((response) => {
            // Remember to close connection after finish
            client.close();

            console.log(
              `Upload successly folder in '${this.localPath}' to ${
                this.serverName
                  ? chalk.underline(this.serverName) + ' in server'
                  : chalk.underline('sftp://' + this.scpOptions.host + ':' + this.scpOptions.port)
              }，it spent ${Date.now() - start}ms`,
            );
          })
          .catch((err) => {
            console.log(chalk.red(PLUGIN_NAME + ': Failed upload'));
            console.error(err);
          });
      })
      .catch((err) => {
        console.log(chalk.red(PLUGIN_NAME + ': Failed connect'));
        console.error(err);
      });
  }
}
