const Conf = require('conf');

class Storage {
  constructor() {
    this.conf = new Conf({
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

  clear() {
    return this.conf.clear();
  }

  fetch(key) {
    return this.conf.get(key);
  }

  store(key, value) {
    this.conf.set(key, value);
    return this;
  }
}

module.exports = Storage;
