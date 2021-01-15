const ora = require('ora');
const open = require('open');
const queryString = require('query-string');
const http = require('http');
const chalk = require('chalk');
const url = require('url');

const log = console.log;

// Services
const Configuration = require('./../services/configuration');
const Spotify = require('./../services/spotify');

class Auth {
  constructor() {
    this.configuration = new Configuration();
  }

  async process() {
    try {
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
      const { accessToken, refreshToken } = await this._getAccessToken(
        code,
        clientId,
        clientSecret
      );

      // Save the tokens
      this.configuration.store('accessToken', accessToken);
      this.configuration.store('refreshToken', refreshToken);

      spinner.stop();
      log(chalk.green('You can now start fetching your stats. :)'));

      return Promise.resolve();
    } catch (error) {
      console.error(error);
    }
  }

  async _getAccessToken(code, clientId, clientSecret) {
    // Instantiate the Spotify service
    const spotify = new Spotify({ clientId, clientSecret });

    try {
      const response = await spotify.getAccessToken(code);
      const { access_token, refresh_token } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      throw error;
    }
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
    const url = `https://accounts.spotify.com/authorize`;
    const params = {
      client_id: clientId,
      response_type: 'code',
      redirect_uri: 'http://localhost:8080/callback',
      scope: 'user-read-private,user-read-email,user-top-read,user-read-recently-played',
    };

    const browserUrl = `${url}?${queryString.stringify(params)}`;
    return open(browserUrl);
  }

  /**
   * Creates a basic HTTP server to listen the callback url and get the code from Spotify.
   */
  _callbackServer() {
    return new Promise((resolve, reject) => {
      const server = http
        .createServer(async (req, res) => {
          const parsedUrl = url.parse(req.url, true);

          // Make sure we're listening from /callback
          if (parsedUrl.pathname === '/callback') {
            const { code } = parsedUrl.query;

            res.end();
            req.connection.end();
            req.connection.destroy();

            // Close the server
            server.close();

            return resolve(code);
          }
        })
        .listen(8080);
    });
  }
}

module.exports = Auth;
