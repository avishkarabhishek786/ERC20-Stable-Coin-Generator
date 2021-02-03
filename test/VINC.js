/*
const EDGECOIN = artifacts.require('EDGECOIN');

contract('EDGECOIN', ([account1, account2, account3])=> {

    let EDGECOIN = null; //
    let contract_name = "";
    let symbol = ""; 
    let totalSupply = 0; 

    before(async () =>{
        contract_name = "Token 1";
        symbol = "TKN1"; 
        totalSupply = 1000; 
        EDGECOIN = await EDGECOIN.deployed(contract_name, symbol, totalSupply);
    }); 

    it('should deploy smart contract properly', async () => {
        assert(EDGECOIN.address !== '');
        assert(EDGECOIN.address !== null);
        assert(EDGECOIN.address !== undefined);
    });

    it('should have a name', async () => {
        const _contract_name = await EDGECOIN.name();
        assert(_contract_name === contract_name);
    });

    it('should have a symbol', async () => {
        const _symbol = await EDGECOIN.symbol();
        assert(_symbol === symbol);
    });

    it('should have 18 decimals', async () => {
        const _decimal = await EDGECOIN.decimals();
        assert(_decimal.toNumber() === 18);
    });

    it('should have a total supply', async () => {
        const _totalSupply = await EDGECOIN.totalSupply();
        assert(_totalSupply.toNumber() === totalSupply);
    });

    it('should pause the contract', async () => {
        await EDGECOIN.stop();
        const is_paused = await EDGECOIN.paused();
        assert(is_paused === true);
    });

    it('should unpause the contract', async () => {
        await EDGECOIN.start();
        const is_paused = await EDGECOIN.paused();
        assert(is_paused === false);
    });

});
*/