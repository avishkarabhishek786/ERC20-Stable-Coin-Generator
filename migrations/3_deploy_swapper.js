const TokenExchange = artifacts.require("TokenExchange");

module.exports = async function (deployer, _network, accounts) {

    await deployer.deploy(TokenExchange, {from: accounts[0]});
    const tokenExchange = await TokenExchange.deployed();
    console.log(tokenExchange.address);

};
