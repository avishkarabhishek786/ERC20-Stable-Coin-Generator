const VINC = artifacts.require("VINC");
const TokenFactory = artifacts.require("TokenFactory");
const TokenExchange = artifacts.require("TokenExchange");

module.exports = async function (deployer, _network, accounts) {

    await deployer.deploy(TokenFactory, {from: accounts[0]});

    //   await deployer.deploy(VINC, "Token 1", "TKN1", 1000, {from: accounts[0]});
//   const token1 = await VINC.deployed();

//   await deployer.deploy(VINC, "Token 2", "TKN2", 1000, {from: accounts[1]});
//   const token2 = await VINC.deployed();

//   await deployer.deploy(TokenExchange, token1.address, token2.address, {from: accounts[2]});
//   const tokenExchange = await TokenExchange.deployed();

//   const token1Addr = token1.address;
//   const token2Addr = token2.address;
//   const tokenExchangeAddr = tokenExchange.address;

//   console.log("token1 address", token1Addr);  
//   console.log("token2 address", token2Addr);  
//   console.log("tokenExchange address", tokenExchangeAddr);  




};
