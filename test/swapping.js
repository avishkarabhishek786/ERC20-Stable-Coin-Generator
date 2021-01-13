/*
const VINC = artifacts.require('VINC');
const TokenExchange = artifacts.require("TokenExchange");

contract('SwapTest', ([account1, account2, account3])=> {

    let token1 = null; //
    let token2 = null; //
    let tokenExchange = null; //
    let tokenExchangeAddr = null; //
    
    before(async () =>{
        token1 = await VINC.new("Token 1", "TKN1", 1000, {from: account1});
        token2 = await VINC.new("Token 2", "TKN2", 1000, {from: account2});
        tokenExchange = await TokenExchange.new(token1.address, token2.address, {from: account3});

        tokenExchangeAddr = tokenExchange.address;
    }); 

    it('should check owners', async () => {
        const owner1 = await token1.owner();
        const owner2 = await token2.owner();

        assert(owner1 === account1);
        assert(owner2 === account2);
    });

    it('should approve tokens', async () => {
        await token1.approve(tokenExchangeAddr, 100, {from: account1});
        let allowance1 = await token1.allowance(account1, tokenExchangeAddr);

        await token2.approve(tokenExchangeAddr, 100, {from: account2});
        let allowance2 = await token2.allowance(account2, tokenExchangeAddr);
        
        assert(allowance1.toNumber() === 100);
        assert(allowance2.toNumber() === 100);
    });

    it('should set expected amount', async () => {
        await token1.set_expected_receiving_tokens(account2, 50, {from: account1});
        let expected_receiving_tokens1 = await token1.expected_receiving_tokens(account2);

        await token2.set_expected_receiving_tokens(account1, 50, {from: account2});
        let expected_receiving_tokens2 = await token2.expected_receiving_tokens(account1);

        assert(expected_receiving_tokens1.toNumber() === 50);
        assert(expected_receiving_tokens2.toNumber() === 50);
    });

    it('should swap tokens', async () => {
        await tokenExchange.swap(account1, 50, account2, 50, {from: account1});
        let balanceAcc1 = await token2.balanceOf(account1);
        let balanceAcc2 = await token1.balanceOf(account2);

        assert(balanceAcc1.toNumber()==50);
        assert(balanceAcc2.toNumber()==50);

        // assert.equal(result.receipt.status, true);
        // assert.equal(result.logs[0].args.name,zombieNames[0]);
    });


});
*/