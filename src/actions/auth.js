const ora = require('ora');
const open = require('open');
const queryString = require('query-string');
const http = require('http');
const chalk = require('chalk');
const url = require('url');
const fs = require('fs');
const path = require('path');

const { log } = console;

// Services
const Configuration = require('../services/configuration');
const Spotify = require('../services/spotify');

class Auth {
  constructor() {
    this.configuration = new Configuration();
  }

  async process() {
    // Get the client id and secret
    const { clientId, clientSecret } = this._getClientKeys();

    // Open the browser
    const spinner = ora('Opening your default browser for Spotify authentication...').start();
    await this._openBrowser(clientId);

    spinner.text = 'Waiting for response from Spotify...';

    // Start a HTTP Server to listen for callback
    const code = await this._callbackServer();

    spinner.stop();
    log(chalk.green('Authentication with Spotify is a success!'));

    // Let's get the access token from spotify
    spinner.start('Fetching tokens...');
    const { accessToken, refreshToken } = await this._getAccessToken(code, clientId, clientSecret);

    // Save the tokens
    this.configuration.store('accessToken', accessToken);
    this.configuration.store('refreshToken', refreshToken);

    spinner.stop();
    log(chalk.green('You can now start fetching your stats. :)'));

    return Promise.resolve();
  }

  async _getAccessToken(code, clientId, clientSecret) {
    // Instantiate the Spotify service
    const spotify = new Spotify({ clientId, clientSecret });

    const response = await spotify.getAccessToken(code);
    const { access_token: accessToken, refresh_token: refreshToken } = response.data;

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Fetches the clientId and clientSecret
   */
  _getClientKeys() {
    const clientId = this.configuration.fetch('clientId');
    const clientSecret = this.configuration.fetch('clientSecret');

    return { clientId, clientSecret };
  }

  /**
   * Opens up the authorize page in Spotify.
   */
  async _openBrowser(clientId) {
    const authorizeUrl = `https://accounts.spotify.com/authorize`;
    const params = {
      client_id: clientId,
      response_type: 'code',
      redirect_uri: 'http://localhost:8080/callback',
      scope: 'user-read-private,user-read-email,user-top-read,user-read-recently-played',
    };

    const browserUrl = `${authorizeUrl}?${queryString.stringify(params)}`;
    return open(browserUrl);
  }

  /**
   * Creates a basic HTTP server to listen the callback url and get the code from Spotify.
   */
  _callbackServer() {
    return new Promise((resolve) => {
      const server = http
        .createServer(async (req, res) => {
          const parsedUrl = url.parse(req.url, true);

          // Make sure we're listening from /callback
          if (parsedUrl.pathname === '/callback') {
            const { code } = parsedUrl.query;

            const successHtmlPage = fs.readFileSync(
              path.join(`${__dirname}/../page/success.html`),
              'utf-8'
            );

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(successHtmlPage);
            res.end();

            req.connection.end();
            req.connection.destroy();

            // Close the server
            server.close();

            return resolve(code);
          }

          return false;
        })
        .listen(8080);
    });
  }
}

module.exports = Auth;
