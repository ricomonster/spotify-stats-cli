const minimist = require('minimist');

const Config = require('./config');
const Login = require('./login');
const Stats = require('./stats');

const usage = () => {
  const usageText = `
  Spotify Stats CLI.

  usage:
    spotify-stats-cli [command] <options>

  commands can be:

    login             in order to retrieve the songs/artists you need to login first
    songs             returns your top 50 songs
    artists           returns your top 50 artists
    config            set your Spotify Client ID and Client Secret.

  options:
    --help            show help
  `;

  console.log(usageText);
};

const cli = (args) => {
  const argv = minimist(args);

  switch (argv._[2]) {
    case 'config':
      const config = new Config();
      return config.process(argv);

    case 'login':
      const login = new Login();
      return login.process();

    case 'songs':
      const songs = new Stats({ type: 'tracks' });
      return songs.process(argv);

    case 'artists':
      const artists = new Stats({ type: 'artists' });
      return artists.process(argv);
      break;

    case 'help':
    default:
      usage();
      break;
  }
};

module.exports = cli;
