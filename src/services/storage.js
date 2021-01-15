const { rejects } = require('assert');
const fs = require('fs');
const path = require('path');

class Storage {
  constructor(filename) {
    this.filename = filename;
  }

  /**
   * Fetches the contents of the file.
   *
   * @returns {*}
   */
  async get() {
    // Generate the filename
    const filename = this._generateFilename();

    // Does it exists?
    if (!fs.existsSync(filename)) {
      throw new Error('File does not exists.');
    }

    return new Promise((resolve) => {
      fs.stat(filename, (err) => {
        if (!err) {
          const raw = fs.readFileSync(filename);
          return resolve(raw);
        }
      });
    });
  }

  /**
   * Creates a file or store the contents to the file.
   *
   * @params {*} data
   * @returns {String}
   */
  async store(data) {
    // Check the storage directory first
    this._createStorageDirectory();

    // Generate the filename
    const filename = this._generateFilename();

    // Write the file
    const file = await fs.writeFileSync(filename, data);

    // Return the filename
    return filename;
  }

  async remove() {
    // Get the filename
    const filename = this._generateFilename();

    // Does it exists?
    if (!fs.existsSync(filename)) {
      throw new Error('File does not exists.');
    }

    // Remove it
    return fs.unlinkSync(filename);
  }

  /**
   * Creates a storage directory.
   *
   * @returns {Boolean}
   */
  _createStorageDirectory() {
    const directoryPath = path.join(path.resolve('./'), 'storage');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    return true;
  }

  /**
   * Generates the file path of the file given.
   *
   * @returns {String}
   */
  _generateFilename() {
    if (!this.filename) {
      throw new Error('Filename is required.');
    }

    return [
      path.resolve('./'),
      'storage',
      this.filename.indexOf('.json') === -1 ? `${this.filename}.json` : this.filename,
    ].join('/');
  }
}

module.exports = Storage;
