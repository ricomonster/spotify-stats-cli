const Conf = require('conf');

class Config {
  constructor() {
    this.storage = new Conf({
      clientId: {
        type: 'string',
      },
      clientSecret: {
        type: 'string',
      },
      accessToken: {
        type: 'string',
      },
      refreshToken: {
        type: 'string',
      },
    });
  }

  process(args) {
    // Validate the arguments
    // Client ID and Client Secret given
    if (args.clientId && args.clientSecret) {
      // Set it up
      this.storage.set('clientId', args.clientId);
      this.storage.set('clientSecret', args.clientSecret);

      console.log('Client ID and Secret are now stored.');
      return true;
    }

    // Help option
    if (args.help) {
      return this.showUsage();
    }

    // Determine if there's an argument given and it's invalid
    let unknownOption = false;
    let options = [];
    Object.keys(args).forEach((arg) => {
      if (!['clientId', 'clientSecret', 'help', '_'].includes(arg)) {
        unknownOption = true;
        options.push(arg);
      }
    });

    // Unknown option?
    if (unknownOption) {
      console.log(
        `  Unknown ${options.length > 1 ? 'options' : 'option'}. --${options.join(', --')}`
      );
    }

    return this.showUsage();
  }

  showUsage() {
    console.log(`
  options:
    --clientId        sets or shows the Client ID.
    --clientSecret    sets or shows the Client Secret.
    `);
  }
}

module.exports = Config;
