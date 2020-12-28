const VINC = artifacts.require("VINC");
const TokenExchange = artifacts.require("TokenExchange");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(VINC, "Token 1", "TKN1", 1000, {from: accounts[0]});
  const token1 = await VINC.deployed();

  await deployer.deploy(VINC, "Token 2", "TKN2", 1000, {from: accounts[1]});
  const token2 = await VINC.deployed();

  await deployer.deploy(TokenExchange, token1.address, token2.address, {from: accounts[2]});
  const tokenExchange = await TokenExchange.deployed();

//   const tokenExchangeAddr = tokenExchange.address;

  const owner1 = await token1.owner();
  const owner2 = await token2.owner();

  console.log(owner1);
  console.log(owner2);
  console.log(accounts[0], accounts[1], accounts[2]);

//   console.log(tokenExchangeAddr);
//   console.log(owner1==accounts[0]);
//   console.log(owner2==accounts[1]);

//   await token1.approve(tokenExchangeAddr, 100);
//   let allowance1 = await token1.allowance(owner1, tokenExchangeAddr);
//   console.log("allowance1", allowance1.toString());

//   await token2.approve(tokenExchangeAddr, 100);
//   let allowance2 = await token1.allowance(owner2, tokenExchangeAddr);
//   console.log("allowance2", allowance2.toString());

//   await token1.set_expected_receiving_tokens(owner2, 50);
//   let expected_receiving_tokens1 = await token1.expected_receiving_tokens(owner2);
//   console.log("expected_receiving_tokens1", expected_receiving_tokens1);
  
//   await token2.set_expected_receiving_tokens(owner1, 50);
//   let expected_receiving_tokens2 = await token2.expected_receiving_tokens(owner1);
//   console.log("expected_receiving_tokens2", expected_receiving_tokens2);


};
