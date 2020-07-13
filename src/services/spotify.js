const axios = require('axios');
const queryString = require('query-string');

class Spotify {
  constructor(opts) {
    this.clientId = opts.clientId || '';
    this.clientSecret = opts.clientSecret || '';
    this.accessToken = opts.accessToken || '';
  }

  getAccessToken(code) {
    return this._tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:5000/callback',
    });
  }

  getUserTop(type, params = {}) {
    // Before we proceed, let's check if there's access token provided
    if (!this.accessToken || this.accessToken.length < 1) {
      throw new Error('Access token is required.');
    }

    return axios.get(`https://api.spotify.com/v1/me/top/${type}`, {
      params: {
        ...params,
        limit: 50,
        time_range: params.time_range || 'short_term',
      },
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  refreshTokens(refreshToken) {
    return this._tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
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

    return axios.post(`https://accounts.spotify.com/api/token`, queryString.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorizationToken}`,
      },
    });
  }
}

module.exports = Spotify;
