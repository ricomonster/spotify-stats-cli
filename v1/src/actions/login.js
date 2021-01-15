const fs = require('fs');
const http = require('http');
const open = require('open');
const queryString = require('query-string');
const url = require('url');
const axios = require('axios');

const Config = require('./config');
const Spotify = require('./../services/spotify');

class Login {
  constructor() {
    this.config = new Config();

    this.clientId = this.config.storage.get('clientId');
    this.clientSecret = this.config.storage.get('clientSecret');
    this.accessToken = this.config.storage.get('accessToken');
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
      this.config.storage.set('accessToken', access_token);
      this.config.storage.set('refreshToken', refresh_token);

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
    if (!this.accessToken) {
      // We don't have token so we need to login the user
      // Open up the browser
      console.log('Opening up browser to authenticate...');
      await this.openBrowser();

      // Open up a http server to listen for callback
      await this.listenForCallback();
    } else {
      console.log('You are already authenticated.');
      return false;
    }
  }

  async openBrowser() {
    const url = `https://accounts.spotify.com/authorize`;
    const params = {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: 'http://localhost:5000/callback',
      scope: 'user-read-private,user-read-email,user-top-read,user-read-recently-played',
    };

    const browserUrl = `${url}?${queryString.stringify(params)}`;
    return open(browserUrl);
  }
}

module.exports = Login;
