const VINC = artifacts.require("VINC");
const TokenFactory = artifacts.require("TokenFactory");
const TokenExchange = artifacts.require("TokenExchange");

module.exports = async function (deployer, _network, accounts) {

    let tokenName1 = "Token 1";
    let tokenName2 = "Token 2";
    let tokenSymbol1 = "TKN1";
    let tokenSymbol2 = "TKN2";
    let initialSupply1 = 1000;
    let initialSupply2 = 500;

    await deployer.deploy(TokenFactory, {from: accounts[0]});
    const tokenFactory = await TokenFactory.deployed();

    await deployer.deploy(TokenExchange, {from: accounts[0]});
    const tokenExchange = await TokenExchange.deployed();

    await tokenFactory.createToken(tokenName1, tokenSymbol1, initialSupply1, {from: accounts[1]});
    await tokenFactory.createToken(tokenName2, tokenSymbol2, initialSupply2, {from: accounts[2]});
        

    console.log("token 1 address", await tokenFactory.tokensList(accounts[1]));

    console.log("token 2 address", await tokenFactory.tokensList(accounts[2]));

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
