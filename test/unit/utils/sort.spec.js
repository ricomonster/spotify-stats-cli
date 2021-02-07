const { expect } = require('chai');

// Support
const { spotify: spotifyMock, storage } = require('test/support/mock');

// Services
const Storage = require('src/services/storage');

// Utils
const Sort = require('src/utils/sort');

describe('Utils :: Sort', () => {
  context('should work properly', () => {
    let sortClassWithContent;
    before(async () => {
      sortClassWithContent = new Storage('storage', 'artists-test-content');

      // Let's manipulate some records
      const timestamp = Math.round(new Date().getTime() / 1000);
      storage.artists[10].timestamp = timestamp;
      storage.artists[10].previousRank = 20;

      storage.artists[11].timestamp = timestamp;
      storage.artists[11].previousRank = 10;

      storage.artists[9].timestamp = timestamp;
      storage.artists[9].previousRank = 0;

      await sortClassWithContent.store(JSON.stringify(storage.artists));
    });

    after(async () => {
      // Remove the file
      const storageClass = new Storage('storage', 'artists-test');
      await storageClass.remove();
    });

    it('should sort and return something', async () => {
      const sort = new Sort();
      const results = await sort.stats(spotifyMock.getUserTopArtists.items, {
        type: 'artists',
        timeline: 'test',
      });

      expect(results).to.be.an('array');
      expect(results[0]).to.be.an('object');
      expect(results[0]).to.be.have.property('change');
      expect(results[0]).to.be.have.property('rank');
      expect(results[0]).to.be.have.property('previousRank');
      expect(results[0]).to.be.have.property('state');
    });

    it('should test the change of rankings and timestamps', async () => {
      const sort = new Sort();
      const results = await sort.stats(spotifyMock.getUserTopArtists.items, {
        type: 'artists',
        timeline: 'test-content',
      });

      expect(results).to.be.an('array');
      expect(results[0]).to.be.an('object');
      expect(results[0]).to.be.have.property('change');
      expect(results[0]).to.be.have.property('rank');
      expect(results[0]).to.be.have.property('previousRank');
      expect(results[0]).to.be.have.property('state');
      expect(results[14]).to.be.have.property('state');
      expect(results[14].state).to.be.equal('new');
    });
  });
});
