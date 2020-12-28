/*
const VINC = artifacts.require('VINC');

contract('VINC', ([account1, account2, account3])=> {

    let vinc = null; //
    let contract_name = "";
    let symbol = ""; 
    let totalSupply = 0; 

    before(async () =>{
        contract_name = "Token 1";
        symbol = "TKN1"; 
        totalSupply = 1000; 
        vinc = await VINC.deployed(contract_name, symbol, totalSupply);
    }); 

    it('should deploy smart contract properly', async () => {
        assert(vinc.address !== '');
        assert(vinc.address !== null);
        assert(vinc.address !== undefined);
    });

    it('should have a name', async () => {
        const _contract_name = await vinc.name();
        assert(_contract_name === contract_name);
    });

    it('should have a symbol', async () => {
        const _symbol = await vinc.symbol();
        assert(_symbol === symbol);
    });

    it('should have 18 decimals', async () => {
        const _decimal = await vinc.decimals();
        assert(_decimal.toNumber() === 18);
    });

    it('should have a total supply', async () => {
        const _totalSupply = await vinc.totalSupply();
        assert(_totalSupply.toNumber() === totalSupply);
    });

    it('should pause the contract', async () => {
        await vinc.stop();
        const is_paused = await vinc.paused();
        assert(is_paused === true);
    });

    it('should unpause the contract', async () => {
        await vinc.start();
        const is_paused = await vinc.paused();
        assert(is_paused === false);
    });

});
*/