// Services
const Storage = require('./storage');

class Cache {
  constructor(cacheFile) {
    this.storage = new Storage(
      'cache',
      cacheFile.indexOf('.json') === -1 ? `${cacheFile}.json` : cacheFile
    );

    this.ttl = 86400;
  }

  /**
   * Fetches the content of the cache file.
   *
   * @returns {Promise|Array}
   */
  async get() {
    let cachedContent = [];

    try {
      const content = await this.storage.get();

      const { timestamp, data } = JSON.parse(content);
      const currentTimestamp = Math.round(new Date().getTime() / 1000);
      if (!timestamp) {
        throw new Error('Cache file error.');
      }

      const difference = currentTimestamp - parseInt(timestamp, 10);
      if (difference > this.ttl) {
        // If the timestamp of the cached data is more than the set TTL, return an empty array
        return [];
      }

      cachedContent = data;
    } catch (error) {
      if (!['File does not exists.'].includes(error.message)) {
        throw error;
      }
    }

    return cachedContent;
  }

  /**
   * Stores the data for caching
   *
   * @returns {Storage|Promise}
   */
  store(data) {
    const currentTimestamp = Math.round(new Date().getTime() / 1000);
    return this.storage.store(JSON.stringify({ timestamp: currentTimestamp, data }));
  }
}

module.exports = Cache;
