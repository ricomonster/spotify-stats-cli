const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

// Actions
const Stats = require('src/actions/stats');

// Services
const Configuration = require('src/services/configuration');
const Spotify = require('src/services/spotify');

// Support
const { spotify: spotifyMock } = require('test/support/mock');

class SpotifyError extends Error {
  constructor(message) {
    super(message);
    this.response = {
      status: 401,
    };
  }
}

describe('Actions :: Stats', () => {
  context('should work properly', () => {
    let statsClass;

    afterEach(() => {
      sandbox.restore();
    });

    before(() => {
      statsClass = new Stats();
    });

    it('should return artists stats', async () => {
      sandbox.stub(Configuration.prototype, 'fetch').returns('1234567890');
      sandbox
        .stub(Spotify.prototype, 'getUserTop')
        .resolves(Promise.resolve({ data: spotifyMock.getUserTopArtists }));

      const response = await statsClass.execute({ type: 'artists', timeline: 'short_term' });

      expect(response).to.be.an('array');
      expect(response[0]).to.be.an('object');
      expect(response[0]).to.have.property('external_urls');
    });

    it('should try to fetch the list and refresh for tokens', async () => {
      const mockConfigFetch = sandbox.stub(Configuration.prototype, 'fetch');
      const mockSpotifyGetUserTop = sandbox.stub(Spotify.prototype, 'getUserTop');

      mockSpotifyGetUserTop
        .onCall(0)
        .rejects(new SpotifyError('Request failed with status code 401'));
      mockSpotifyGetUserTop
        .onCall(1)
        .resolves(Promise.resolve({ data: spotifyMock.getUserTopArtists }));

      mockConfigFetch.withArgs('accessToken').onCall(0).returns('accessToken');
      mockConfigFetch.withArgs('clientId').onCall(1).returns('client-id');
      mockConfigFetch.withArgs('clientSecret').onCall(2).returns('client-secret');
      mockConfigFetch.withArgs('refreshToken').onCall(3).returns('refresh-token');

      sandbox
        .stub(Spotify.prototype, 'refreshTokens')
        .resolves(Promise.resolve({ data: { access_token: '1234567890' } }));

      const response = await statsClass.execute({ type: 'artists', timeline: 'short_term' });

      expect(response).to.be.an('array');
      expect(response[0]).to.be.an('object');
      expect(response[0]).to.have.property('external_urls');
    });
  });

  context('should not work properly', () => {
    let statsClass;

    before(() => {
      statsClass = new Stats();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an error that type is missing or required.', async () => {
      try {
        await statsClass.execute({});
      } catch (error) {
        expect(error.message).to.be.equal('Type of the stat to be fetched is required.');
      }
    });

    it('should return an error that type is unknown.', async () => {
      try {
        await statsClass.execute({ type: 'foo', timeline: 'foo' });
      } catch (error) {
        expect(error.message).to.be.equal('Unknown stat type foo.');
      }
    });

    it('should return an error that timeline is missing or required.', async () => {
      try {
        await statsClass.execute({ type: 'foo' });
      } catch (error) {
        expect(error.message).to.be.equal('Timeline of the stats to be fetched is required.');
      }
    });

    it('should return an error that timeline is unknown.', async () => {
      try {
        await statsClass.execute({ type: 'tracks', timeline: 'foo' });
      } catch (error) {
        expect(error.message).to.be.equal('Unknown timeline foo.');
      }
    });

    it('should return an error if there is no access token saved.', async () => {
      sandbox.stub(Configuration.prototype, 'fetch').withArgs('accessToken').returns(null);

      try {
        await statsClass.execute({ type: 'tracks', timeline: 'short_term' });
      } catch (error) {
        expect(error.message).to.be.equal('Access token is required.');
      }
    });
  });
});
