const { expect } = require('chai');
const sinon = require('sinon');

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
      sortClassWithContent = new Storage('artists-test-content');
      await sortClassWithContent.store(JSON.stringify(storage.artists));
    });

    after(async () => {
      // Remove the file
      const storage = new Storage('artists-test');
      await storage.remove();
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