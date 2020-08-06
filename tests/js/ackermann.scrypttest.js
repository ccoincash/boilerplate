const { expect } = require('chai');
const { buildContractClass } = require('scryptjs');
const { loadDesc } = require('../../helper');

describe('Test sCrypt contract Ackermann In Javascript', () => {
  let ackermann;

  before(() => {
    const Ackermann = buildContractClass(loadDesc('ackermann_desc.json'));
    ackermann = new Ackermann(2, 1);
  });

  it('should return true', () => {
    expect(ackermann.unlock(5).verify()).to.equal(true);
  });

  it('should throw error', () => {
    expect(() => { ackermann.unlock(0).verify() }).to.throws(/failed to verify/);
  });
});
