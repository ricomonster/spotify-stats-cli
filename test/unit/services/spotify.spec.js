const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');

const sandbox = sinon.createSandbox();

// Support
const { spotify: spotifyMock } = require('test/support/mock');

// Services
const Spotify = require('src/services/spotify');

describe('Services :: Spotify', () => {
  context('should work properly', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should return an access and refresh tokens', async () => {
      const spotifyClass = new Spotify({
        clientId: '1234567890',
        clientSecret: '0987654321',
      });

      sandbox
        .stub(axios, 'post')
        .resolves(
          Promise.resolve({ data: { access_token: '1234567890', refresh_token: '0987654321' } })
        );

      const response = await spotifyClass.getAccessToken('1234567890');

      expect(response).to.be.an('object');
      expect(response).to.have.property('data');
      expect(response.data).to.have.property('refresh_token');
      expect(response.data).to.have.property('access_token');
    });

    it('should return tracks/artists lists', async () => {
      const spotifyClass = new Spotify({
        accessToken: '1234567890',
      });

      sandbox.stub(axios, 'get').resolves(Promise.resolve({ data: spotifyMock.getUserTopArtists }));

      const response = await spotifyClass.getUserTop('tracks');

      expect(response).to.be.an('object');
      expect(response).to.have.property('data');
      expect(response.data).to.have.property('items');
      expect(response.data.items).to.be.an('array');
    });

    it('should return a refreshed tokens', async () => {
      const spotifyClass = new Spotify({
        clientId: '1234567890',
        clientSecret: '0987654321',
      });

      sandbox
        .stub(axios, 'post')
        .resolves(Promise.resolve({ data: { access_token: '1234567890' } }));

      const response = await spotifyClass.refreshTokens('token');

      expect(response).to.be.an('object');
      expect(response).to.have.property('data');
      expect(response.data).to.have.property('access_token');
      expect(response.data.access_token).to.be.equal('1234567890');
    });
  });

  context('should not work properly', () => {
    it('should throw an error regarding client id and secret is required.', async () => {
      const spotifyClass = new Spotify();

      try {
        await spotifyClass.getAccessToken('1234567890');
      } catch (error) {
        expect(error.message).to.be.equal('Client ID or Secret is required.');
      }
    });

    it('should return an error that access token is required.', async () => {
      const spotifyClass = new Spotify();

      try {
        await spotifyClass.getUserTop('tracks');
      } catch (error) {
        expect(error.message).to.be.equal('Access token is required.');
      }
    });
  });
});
