const { Command, program } = require('commander');

// Actions
const Config = require('./actions/config');

const cli = () => {
  program.version('1.1.0').description('Spotify Stats CLI.');

  // Build out the commands
  // Config Command
  program
    .command('config')
    .description('set your Spotify Client ID and Client Secret.')
    .requiredOption('--clientId <clientId>', 'sets or shows the Client ID.')
    .requiredOption('--clientSecret <clientSecret>', 'sets or shows the Client Secret.')
    .action(async (cmd) => {
      const config = new Config();
      const result = await config.execute({
        clientId: cmd.clientId,
        clientSecret: cmd.clientSecret,
      });
    });

  // Track Stats Command
  program
    .command('tracks')
    .description('returns your top 50 tracks/songs.')
    .option('--last4weeks', 'fetches the stats approx. the last 4 weeks.')
    .option('--last6months', 'fetches the stats approx. the last 6 months.')
    .option('--alltime', 'fetches the stats all time if possibly.')
    .action((cmd) => {
      let timeline = 'short_term';

      // Determine the timeline of the stats that we're going to fetch.
      if (cmd.last6months) {
        timeline = 'medium_term';
      }

      if (cmd.alltime) {
        timeline = 'long_term';
      }
    });

  program.parseAsync(process.argv);

  // console.log(program);
};

module.exports = cli;
