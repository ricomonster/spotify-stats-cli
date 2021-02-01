const axios = require('axios');
const qs = require('query-string');

class Spotify {
  constructor(opts) {
    this.clientId = opts && opts.clientId ? opts.clientId : '';
    this.clientSecret = opts && opts.clientSecret ? opts.clientSecret : '';
    this.accessToken = opts && opts.accessToken ? opts.accessToken : '';
  }

  /**
   * Fetches the access and refresh token using the code given by Spotify after authorization.
   *
   * @param {String} code
   * @returns {Promise}
   */
  getAccessToken(code) {
    return this._tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:8080/callback',
    });
  }

  /**
   * Fetches the user's top stats for either artists or tracks.
   *
   * @param {String} type
   * @param {Object} params
   * @returns {Error|Promise}
   */
  getUserTop(type, params = {}) {
    // Validate
    this._validateAccessToken();

    // Perform the request
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

  /**
   * Refreshes the tokens that are being used in accessing the API
   *
   * @param {String}
   * @returns {Promise}
   */
  refreshTokens(token) {
    return this._tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: token,
    });
  }

  /**
   * Validates if the access token is provided.
   *
   * @returns {Error|Boolean}
   */
  _validateAccessToken() {
    if (!this.accessToken || this.accessToken.length < 1) {
      throw new Error('Access token is required.');
    }

    return true;
  }

  /**
   * Validates the credentials and setups the request to fetch the tokens from Spotify.
   *
   * @param {String} params
   * @returns {Promise}
   */
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
