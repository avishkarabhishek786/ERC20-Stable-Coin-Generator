const VINC = artifacts.require('VINC');
const TokenFactory = artifacts.require("TokenFactory");
const TokenExchange = artifacts.require("TokenExchange");

contract('TokenFactoryTest', ([account1, account2, account3])=> {

    let token1 = null; //
    let token2 = null; //
    let tokenFactory = null; //
    let tokenFactoryAddr = null; //
    let token1Addr = null; //
    let token2Addr = null; //
    let tokenName1 = ""; //
    let tokenName2 = ""; //
    let tokenSymbol1 = ""; //
    let tokenSymbol2 = ""; //
    let initialSupply1 = 0; //
    let initialSupply2 = 0; //
    let tokenExchange = null;
    let tokenExchangeAddr = "";
    
    before(async () =>{
        
        tokenName1 = "Token 1";
        tokenName2 = "Token 2";
        tokenSymbol1 = "TKN1";
        tokenSymbol2 = "TKN2";
        initialSupply1 = 1000;
        initialSupply2 = 500;

        // 1. Deploy factory        
        tokenFactory = await TokenFactory.new({from: account1});
        tokenFactoryAddr = tokenFactory.address;
        
        // 2.1 Create tokens
        await tokenFactory.createToken(tokenName1, tokenSymbol1, initialSupply1, {from: account2});
        await tokenFactory.createToken(tokenName2, tokenSymbol2, initialSupply2, {from: account3});
        
        // 2.2 Fetch addresses of deployed tokens from TokenFactory
        token1Addr = await tokenFactory.tokensList(account2);
        token2Addr = await tokenFactory.tokensList(account3);

        // 2.3 Create instances of both tokens
        token1 = await VINC.at(token1Addr);
        token2 = await VINC.at(token2Addr);

        // 3. Deploy Swap TokenExchange
        tokenExchange = await TokenExchange.new(token1Addr, token2Addr, {from: account1});

        tokenExchangeAddr = tokenExchange.address;

    
    }); 

    describe('Token functions', async () => {

        it('should check token address', async () => {
            assert(token1Addr !== 0);
            assert(token1Addr !== "0x0000000000000000000000000000000000000000");
            assert(token2Addr !== 0);
            assert(token2Addr !== "0x0000000000000000000000000000000000000000");
        });
    
        it('should check owners', async () => {
            const owner1 = await token1.owner();
            const owner2 = await token2.owner();
            assert.equal(owner1, account2);
            assert.equal(owner2, account3);
        });
    
        it('should have a name', async () => {
            const _contract_name1 = await token1.name();
            const _contract_name2 = await token2.name();
            assert.equal(_contract_name1, tokenName1);
            assert.equal(_contract_name2, tokenName2);
        });
    
        it('should have a symbol', async () => {
            const _symbol1 = await token1.symbol();
            const _symbol2 = await token2.symbol();
            assert.equal(_symbol1, tokenSymbol1);
            assert.equal(_symbol2, tokenSymbol2);
        });
    
        it('should check balances', async () => {
            const _balance1 = await token1.balanceOf(account2);
            const _balance2 = await token2.balanceOf(account3);
            assert.equal(_balance1.toString(), initialSupply1);
            assert.equal(_balance2.toString(), initialSupply2);
        });
    });

    describe('Swap functions', async () => {
    
        it('should approve tokens', async () => {
            await token1.approve(tokenExchangeAddr, 100, {from: account2});
            let allowance1 = await token1.allowance(account2, tokenExchangeAddr);
    
            await token2.approve(tokenExchangeAddr, 100, {from: account3});
            let allowance2 = await token2.allowance(account3, tokenExchangeAddr);
            
            assert.equal(allowance1.toNumber(), 100);
            assert.equal(allowance2.toNumber(), 100);
        });

        it('should set expected amount', async () => {
            // account2 is expecting to get 40 token2 from account3
            await token2.set_expected_receiving_tokens(account3, 40, {from: account2});
            let expected_receiving_tokens2 = await token2.expected_receiving_tokens(account2, account3);
    
            // account3 is expecting to get 30 token1 from account2
            await token1.set_expected_receiving_tokens(account2, 30, {from: account3});
            let expected_receiving_tokens1 = await token1.expected_receiving_tokens(account3, account2);
    
            assert.equal(expected_receiving_tokens1.toNumber(), 30);
            assert.equal(expected_receiving_tokens2.toNumber(), 40);
        });
    
        it('should swap tokens', async () => {
            await tokenExchange.swap(account2, token1Addr, 30, account3, token2Addr, 40, {from: account2});
            let balanceAcc1 = await token1.balanceOf(account3);
            let balanceAcc2 = await token2.balanceOf(account2);
    
            assert.equal(balanceAcc1.toNumber(), 30);
            assert.equal(balanceAcc2.toNumber(), 40);
    
            // assert.equal(result.receipt.status, true);
            // assert.equal(result.logs[0].args.name,zombieNames[0]);
        });

    });


});