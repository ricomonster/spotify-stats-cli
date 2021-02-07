const { expect, assert } = require('chai');
const fs = require('fs');

const Cache = require('src/services/cache');
const Storage = require('src/services/storage');

describe('Services :: Cache', () => {
  context('should work properly', () => {
    let cacheClass;
    let withJsonCacheClass;
    let expiredCacheContent;

    before(async () => {
      cacheClass = new Cache('test-content');
      withJsonCacheClass = new Cache('with-json.json');

      // For expired cache
      const yesterdayTimestamp = Math.round(new Date().getTime() / 1000) - 86401;
      expiredCacheContent = new Storage('cache', 'expired-cache');
      await expiredCacheContent.store(
        JSON.stringify({ timestamp: yesterdayTimestamp, data: { test: 1234567890 } })
      );
    });

    after(async () => {
      // Delete files
      const testContentStorage = new Storage('cache', 'test-content');
      await testContentStorage.remove();

      const withJsonCache = new Storage('cache', 'with-json');
      await withJsonCache.remove();

      await expiredCacheContent.remove();
    });

    it('should store data to the cache', async () => {
      const file = await cacheClass.store({ test: 1234567890 });

      assert.isOk(fs.existsSync(file));
    });

    it('should return cached data', async () => {
      const content = await cacheClass.get();

      expect(content).to.be.an('object');
      expect(content).to.have.property('test');
      expect(content.test).to.be.equal(1234567890);
    });

    it('should return an empty array as the content is beyond the set ttl', async () => {
      const expiredCache = new Cache('expired-cache');
      const content = await expiredCache.get();

      expect(content.length).to.be.equal(0);
    });

    it('should create a file if the filename has .json', async () => {
      const file = await withJsonCacheClass.store({ test: 1234567890 });

      assert.isOk(fs.existsSync(file));
    });

    it('should return an empty array if cache does not exists.', async () => {
      const noCache = new Cache('random-cache');
      const content = await noCache.get();

      expect(content.length).to.be.equal(0);
    });
  });

  context('should not work properly', () => {
    let noTimestampCache;
    before(async () => {
      noTimestampCache = new Storage('cache', 'no-timestamp');
      await noTimestampCache.store(JSON.stringify({ data: { test: 1234567890 } }));
    });

    after(async () => {
      await noTimestampCache.remove();
    });

    it('should throw an error that cache file is invalid', async () => {
      try {
        const cacheClass = new Cache('no-timestamp');
        await cacheClass.get();
      } catch (error) {
        expect(error.message).to.be.equal('Cache file error.');
      }
    });
  });
});
