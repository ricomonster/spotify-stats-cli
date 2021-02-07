const fs = require('fs');
const path = require('path');

class Storage {
  constructor(folder, filename) {
    this.folder = folder;
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

        return false;
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
    // Check if the folder is already created.
    this._createFolderDirectory();

    // Generate the filename
    const filename = this._generateFilename();

    // Write the file
    await fs.writeFileSync(filename, data);

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
   * Creates the directory.
   *
   * @returns {Boolean}
   */
  _createFolderDirectory() {
    if (!this.folder) {
      throw new Error('Folder name is required.');
    }

    const directoryPath = path.join(path.resolve('./'), this.folder);
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
    if (!this.folder) {
      throw new Error('Folder name is required.');
    }

    if (!this.filename) {
      throw new Error('Filename is required.');
    }

    return [
      path.resolve('./'),
      this.folder,
      this.filename.indexOf('.json') === -1 ? `${this.filename}.json` : this.filename,
    ].join('/');
  }
}

module.exports = Storage;
