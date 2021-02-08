const EDGECOIN = artifacts.require("EDGECOIN");
const TokenFactory = artifacts.require("TokenFactory");

module.exports = async function (deployer, _network, accounts) {

    // let tokenName1 = "Alice Token";
    // let tokenName2 = "Bob Token";
    // let tokenSymbol1 = "ALC";
    // let tokenSymbol2 = "BOB";
    // let initialSupply1 = web3.utils.toWei('1000000000', 'Ether'); 
    // let initialSupply2 = web3.utils.toWei('5000000000', 'Ether');

    await deployer.deploy(TokenFactory, {from: accounts[0]});
    const tokenFactory = await TokenFactory.deployed();


    // await tokenFactory.createToken(tokenName1, tokenSymbol1, initialSupply1, {from: accounts[1]});
    // await tokenFactory.createToken(tokenName2, tokenSymbol2, initialSupply2, {from: accounts[2]});
        
    // const tokenAddr1 = await tokenFactory.tokensList(accounts[1])
    // const tokenAddr2 = await tokenFactory.tokensList(accounts[2])

    // console.log("token 1 address", tokenAddr1);

    // console.log("token 2 address", tokenAddr2);

    // Important
    // For each token, approve a address to transfer tokens to facillitate fiat purchase
    // const tokenAddrInst1 = EDGECOIN.at(tokenAddr1);
    // const tokenAddrInst2 = EDGECOIN.at(tokenAddr2);

    // tokenAddrInst1.approve(accounts[8], web3.utils.toWei('100', 'Ether'), {from: accounts[1]});
    // tokenAddrInst2.approve(accounts[9], web3.utils.toWei('100', 'Ether'), {from: accounts[2]});

};
