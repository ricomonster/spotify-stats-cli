const Config = require('./config');

class Auth {
  constructor() {
    this.config = new Config();
  }

  getToken() {
    return this.config.storage.get('accessToken');
  }
}

module.exports = Auth;
