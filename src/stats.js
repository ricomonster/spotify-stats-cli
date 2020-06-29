const axios = require('axios');
const Table = require('cli-table3');

const Config = require('./config');
const Spotify = require('./spotify');
const Storage = require('./storage');

class Stats {
  constructor(opts) {
    this.config = new Config();

    this.limit = 50;
    this.type = opts.type;

    this.clientId = this.config.storage.get('clientId');
    this.clientSecret = this.config.storage.get('clientSecret');
  }

  async process(args) {
    try {
      // Validate if we have a valid arguments
      const { range, help } = this._validateArguments(args);

      if (help) {
        return this._renderHelp();
      }

      // Check first if the user is already authenticated
      const token = this.config.storage.get('accessToken');

      if (!token) {
        console.log('Not yet authenticated! Run spotify-stats- login to authenticate');
        return false;
      }

      // Let's fetch our list
      let list = await this._getStats(token, range);

      // Compare the current list to the previous one then store it.
      list = await this._storeAndCompareList(list, range);

      if (this.type === 'artists') {
        return this._renderArtistList(list);
      }

      if (this.type === 'tracks') {
        return this._renderTrackList(list);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async _getStats(token, timeRange = 'short_term') {
    // Initialize spotify
    const spotify = new Spotify({ accessToken: token });

    try {
      const response = await spotify.getUserTop(this.type, { time_range: timeRange });
      const { items } = response.data;

      const data = [];
      items.forEach((item) => {
        data[item.id] = item;
      });

      return data;
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        // Expired token
        const token = await this._refreshAccessTokens();

        // retry the request
        return this._getStats(token, timeRange);
      }
    }
  }

  async _refreshAccessTokens() {
    // instantiate spotify class
    const spotify = new Spotify({ clientId: this.clientId, clientSecret: this.clientSecret });

    // Get the refresh token
    const refreshToken = this.config.storage.get('refreshToken');

    try {
      const response = await spotify.refreshTokens(refreshToken);
      const { access_token } = response.data;

      // update the access token
      this.config.storage.set('accessToken', access_token);

      return access_token;
    } catch (error) {
      console.log('err', error);
    }
  }

  _renderArtistList(artists) {
    // Set table header
    const table = new Table({
      head: ['Rank', 'Artist'],
    });

    artists.forEach((artist) => {
      // Set the ranking
      let ranking = artist.ranking;
      if (artist.rankChange === 'up') {
        ranking = `${ranking} (+${artist.ranking - artist.previousRank})`;
      }

      if (artist.rankChange === 'down') {
        ranking = `${ranking} (-${artist.previousRank - artist.ranking})`;
      }

      table.push([ranking, artist.name]);
    });

    console.log(table.toString());
  }

  _renderHelp() {
    console.log(`
  options:
    --4weeks    default option. fetches the stats approx. the last 4 weeks
    --6months   fetches the stats approx. the last 6 months
    --alltime   fetches the stats all time if possibly.
    `);
  }

  _renderTrackList(tracks) {
    // Set the header
    const table = new Table({
      head: ['Rank', 'Title', 'Artist'],
    });

    tracks.forEach((track, index) => {
      const artists = [];

      // Get the artists as there's a possibility to have multiple artists
      track.artists.forEach((artist) => {
        artists.push(artist.name);
      });

      // Set the ranking
      let ranking = track.ranking;
      if (track.rankChange === 'up') {
        ranking = `${ranking} (+${track.ranking - track.previousRank})`;
      }

      if (track.rankChange === 'down') {
        ranking = `${ranking} (-${track.previousRank - track.ranking})`;
      }

      table.push([ranking, track.name, artists.join(', ')]);
    });

    console.log(table.toString());
  }

  _statsFilename(range) {
    return [this.type, range].join('-').replace('_', '-');
  }

  async _storeAndCompareList(list, range) {
    // Retrieve first if we have an existing list
    // Generate first the file we're going to retrieve
    const filename = this._statsFilename(range);
    const storage = new Storage({ file: filename });
    const storedStats = await storage.get();

    // Sort out the old stats
    const oldStats = [];
    if (storedStats.length > 0) {
      storedStats.forEach((stat, index) => {
        if (storedStats[stat.id]) {
          storedStats[stat.id] = {};
        }

        storedStats[stat.id] = stat;
      });
    }

    // Now let's compare the new stats and the old stats
    // Loop the new stats
    const toStoredStats = [];
    const toReturnStats = [];
    let rankChange = 'none';
    Object.keys(list).forEach((id, index) => {
      // For easy access
      const stat = list[id];

      // Compute the ranking
      const ranking = index + 1;

      // Check first if it exists in the old stats
      let previousRank = 0;
      if (oldStats[stat.id]) {
        // There's already a saved data
        if (oldStats[stat.id].ranking !== ranking) {
          previousRank = oldStats[stat.id].ranking;

          // There' a change in its rank
          // Compute
          if (oldStats[stat.id].ranking > ranking) {
            rankChange = 'down';
          }

          if (oldStats[stat.id].ranking < ranking) {
            rankChange = 'up';
          }
        }
      } else {
        // New item
        previousRank = ranking;
      }

      toStoredStats.push({
        id: stat.id,
        ranking,
        previousRank,
      });

      toReturnStats.push({
        ...stat,
        ranking,
        previousRank,
        rankChange,
      });
    });

    // Save
    await storage.store(toStoredStats);

    return toReturnStats;
  }

  _validateArguments(args) {
    // Unknown options
    let unknownOption = false;
    let options = [];

    // Stores the possible options
    let ranges = [];
    let showHelp = false;

    // Loop the args
    Object.keys(args).forEach((arg) => {
      if (!['4weeks', '6months', 'alltime', 'help', '_'].includes(arg)) {
        unknownOption = true;
        options.push(arg);
      }

      if (['4weeks', '6months', 'alltime'].includes(arg)) {
        ranges.push(arg);
      }

      if (arg === 'help') {
        showHelp = true;
      }
    });

    // There's an unknown option
    if (unknownOption) {
      const error = new Error('UnknownOption');
      error.data = `Unknown ${options.length > 1 ? 'options' : 'option'}. --${options.join(
        ', --'
      )}`;
      throw new error();
    }

    // Check the range
    let range;
    if (Object.keys(ranges).length > 1) {
      throw new Error('MultipleRange');
    } else {
      switch (ranges[0]) {
        case '6months':
          range = 'medium_term';
          break;

        case 'alltime':
          range = 'long_term';
          break;

        case '4weeks':
        default:
          range = 'short_term';
          break;
      }
    }

    return {
      range,
      help: showHelp,
    };
  }
}

module.exports = Stats;
