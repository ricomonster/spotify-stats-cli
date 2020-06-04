const fs = require('fs');
const http = require('http');
const open = require('open');
const queryString = require('query-string');
const url = require('url');
const axios = require('axios');

const Spotify = require('./spotify');
const Token = require('./token');

class Login {
  constructor() {
    this.tokenPath = process.env.TOKEN_PATH;
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    this.token = new Token();
  }

  async getAccessToken(code) {
    // Instantiate spotify class
    const spotify = new Spotify({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    try {
      const response = await spotify.getAccessToken(code);
      const { access_token, refresh_token } = response.data;

      // Store the access token and the refresh token?
      await this.token.storeAccessToken(access_token);
      await this.token.storeRefreshToken(refresh_token);

      return Promise.resolve();
    } catch (error) {
      console.log('err', error);
    }
  }

  async listenForCallback() {
    const server = http
      .createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);

        // Make sure we're listening from /callback
        if (parsedUrl.pathname === '/callback') {
          const { code } = parsedUrl.query;

          // Get access tokens
          await this.getAccessToken(code);

          console.log('Authentication with Spotify is a success!');
          console.log('You can now start fetching your stats.');

          res.end();
          req.connection.end();
          req.connection.destroy();

          server.close();
        }
      })
      .listen(5000);
  }

  async process() {
    // Let's check if we have an access token stored.
    fs.readFile(this.tokenPath, 'utf8', async (error, token) => {
      if (error !== null || token === '') {
        // We don't have token so we need to login the user
        // Open up the browser
        console.log('Opening up browser to authenticate...');
        await this.openBrowser();

        // Open up a http server to listen for callback
        await this.listenForCallback();
      } else {
        console.log('You are now already authenticated.');
      }
    });
  }

  async openBrowser() {
    const url = `https://accounts.spotify.com/authorize`;
    const params = {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: 'http://localhost:5000/callback',
      scope: 'user-read-private,user-read-email,user-top-read',
    };

    const browserUrl = `${url}?${queryString.stringify(params)}`;
    return open(browserUrl);
  }
}

module.exports = Login;
