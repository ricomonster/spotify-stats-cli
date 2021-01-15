const { expect } = require('chai');
const sinon = require('sinon');

const Configuration = require('src/services/configuration');

describe('Services :: Configuration', () => {
  context('should work properly', () => {
    let configurationClass;

    before(() => {
      configurationClass = new Configuration();
    });

    after(() => {
      configurationClass.clear();
    });

    it('should store an item', () => {
      const result = configurationClass.store('clientId', '1234567890');

      expect(result).to.be.an('object');
    });

    it('should fetch an item', () => {
      const result = configurationClass.fetch('clientId');

      expect(result).to.be.equal('1234567890');
    });
  });
});
