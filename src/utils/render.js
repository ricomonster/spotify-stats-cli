const Table = require('cli-table3');
const chalk = require('chalk');

const { log } = console;

const renderTitle = (type, range) => {
  let rangeTitle;

  switch (range) {
    case 'long_term':
      rangeTitle = 'of all time';
      break;

    case 'medium_term':
      rangeTitle = 'in the last 6 months';
      break;

    case 'short_term':
    default:
      rangeTitle = 'in the last 4 weeks';
  }

  log(chalk.bold(`You top ${type} ${rangeTitle}.`));
};

const renderTrackList = (tracks) => {
  // Set the header
  const table = new Table({
    head: ['Rank', 'Title', 'Artist'],
  });

  tracks.forEach((track) => {
    const { artists: trackArtists, rank, change, state } = track;

    // Get the artists as there's a possibility to have multiple artists
    const artists = trackArtists.map((artist) => artist.name);

    // Determine what to show for rank change
    let ranking = rank;
    if (state === 'new') {
      ranking = `${ranking} (new)`;
    } else {
      const symbol = state === 'up' ? '+' : '-';
      ranking = `${ranking}${state === 'none' ? '' : ` (${symbol}${change})`}`;
    }

    table.push([ranking, track.name, artists.join(', ')]);
  });

  log(table.toString());
};

const renderArtistList = (artists) => {
  // Set table header
  const table = new Table({
    head: ['Rank', 'Artist'],
  });

  artists.forEach((artist) => {
    // Set the ranking
    const { rank, state, change } = artist;

    // Determine what to show for rank change
    let ranking = rank;
    if (state === 'new') {
      ranking = `${ranking} (new)`;
    } else {
      const symbol = state === 'up' ? '+' : '-';
      ranking = `${ranking}${state === 'none' ? '' : ` (${symbol}${change})`}`;
    }

    table.push([ranking, artist.name]);
  });

  log(table.toString());
};

module.exports = ({ data, type, timeline }) => {
  renderTitle(type, timeline);

  if (type === 'tracks') {
    renderTrackList(data);
  }

  if (type === 'artists') {
    renderArtistList(data);
  }
};
