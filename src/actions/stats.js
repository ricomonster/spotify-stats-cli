// Dependencies
const ora = require('ora');

// Services
const Cache = require('../services/cache');
const Configuration = require('../services/configuration');
const Spotify = require('../services/spotify');

class Stats {
  constructor() {
    this.configuration = new Configuration();
  }

  async execute(args) {
    const { type, timeline } = args;

    // Let's validate first
    this._validate(args);

    // Now let's get the access tokens so we can prepare our request to Spotify API
    const accessToken = this.configuration.fetch('accessToken');
    if (!accessToken) {
      throw new Error('Access token is required.');
    }

    // Show spinner
    const spinner = ora('Fetching...').start();

    // Fetch the list
    const stats = await this._getStats(type, timeline, accessToken);

    // Hide spinner
    spinner.stop();

    // Return whatever we have
    return stats;
  }

  _cacheStats(filename, data) {
    const { type, timeline } = filename;
    const cacheFile = [type, timeline.replace('_', '-')].join('-');

    const statsCache = new Cache(cacheFile);
    return statsCache.store(data);
  }

  /**
   * Fetches the cached stats.
   *
   * @param {String} type
   * @param {String} timeline
   * @retutrns {Array}
   */
  _getCachedStats(type, timeline) {
    const filename = [type, timeline.replace('_', '-')].join('-');

    const statsCache = new Cache(filename);
    return statsCache.get();
  }

  /**
   * Fetch the stats from Spotify.
   *
   * @param {String} type
   * @param {String} timeline
   * @param {String} accessToken
   * @returns {Object|Promise}
   */
  async _getStats(type, timeline, accessToken) {
    try {
      // Is there a cached stats?
      const stats = await this._getCachedStats(type, timeline);
      if (stats && stats.length > 0) {
        // Return the cached data
        return stats;
      }

      // Call the Spotify API
      const spotify = new Spotify({ accessToken });
      const response = await spotify.getUserTop(type, { time_range: timeline });
      const { items } = response.data;

      // Store the stats first
      await this._cacheStats({ type, timeline }, items);

      return items;
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        // Expired token
        const newAccessToken = await this._refreshAccessTokens();

        // Retry the request
        return this._getStats(type, timeline, newAccessToken);
      }
    }

    return false;
  }

  /**
   * Requests a new access token to the Spotify API
   *
   * @returns {String}
   */
  async _refreshAccessTokens() {
    // Get the needed parameters from the config
    const clientId = this.configuration.fetch('clientId');
    const clientSecret = this.configuration.fetch('clientSecret');
    const refreshToken = this.configuration.fetch('refreshToken');

    const spotify = new Spotify({ clientId, clientSecret });
    const response = await spotify.refreshTokens(refreshToken);
    const { access_token: accessToken } = response.data;

    // Save the new access token
    this.configuration.store('accessToken', accessToken);

    return accessToken;
  }

  /**
   * Validate the necessary requirements for this functionality.
   *
   * @param {Object} args
   * @returns {Error}
   */
  _validate(args) {
    if (!args.type) {
      throw new Error('Type of the stat to be fetched is required.');
    }

    if (!args.timeline) {
      throw new Error('Timeline of the stats to be fetched is required.');
    }

    if (!['tracks', 'artists'].includes(args.type)) {
      throw new Error(`Unknown stat type ${args.type}.`);
    }

    if (!['short_term', 'medium_term', 'long_term'].includes(args.timeline)) {
      throw new Error(`Unknown timeline ${args.timeline}.`);
    }
  }
}

module.exports = Stats;
