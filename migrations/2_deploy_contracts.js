const VINC = artifacts.require("VINC");

module.exports = function (deployer) {
  deployer.deploy(VINC, "Ally token", "ALLY", 1000);
};
