const axios = require('axios');
const qs = require('query-string');

class Spotify {
  constructor(opts) {
    this.clientId = opts && opts.clientId ? opts.clientId : '';
    this.clientSecret = opts && opts.clientSecret ? opts.clientSecret : '';
    this.accessToken = opts && opts.accessToken ? opts.accessToken : '';
  }

  getAccessToken(code) {
    return this._tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5000/callback',
    });
  }

  _tokenRequest(params) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Client ID or Secret is required.');
    }

    // Generate authorization token
    const authorizationToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64'
    );

    return axios.post(`https://accounts.spotify.com/api/token`, qs.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorizationToken}`,
      },
    });
  }
}

module.exports = Spotify;
