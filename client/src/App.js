import React, { useState, useEffect } from 'react';
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import TokenExchange from "./abis/TokenExchange.json";
import { getWeb3 } from "./utils";

const App = () => {
    const [web3, setWeb3] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [secondTraderAddr, setSecondTraderAddr] = useState(undefined);
    const [token1, setToken1] = useState(undefined);
    const [token2, setToken2] = useState(undefined);
    const [owner1, setOwner1] = useState(undefined);
    const [owner2, setOwner2] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [tokenExchange, setTokenExchange] = useState(undefined);
    const [tokenExchangeAddr, settokenExchangeAddr] = useState(undefined);
    const [swapAllowance, setSwapAllowance] = useState(0);
    const [currentSwapAllowance, setCurrentSwapAllowance] = useState(0);
    const [expectedReceivingAmount, setExpectedReceivingAmount] = useState(0);
    const [currentExpectedReceivingAmount, setCurrentExpectedReceivingAmount] = useState(0);
    const [loggedInAccountToken1Balance, setLoggedInAccountToken1Balance] = useState(0);
    const [loggedInAccountToken2Balance, setLoggedInAccountToken2Balance] = useState(0);
    const [recipientToken1Balance, setRecipientToken1Balance] = useState(0);
    const [recipientToken2Balance, setRecipientToken2Balance] = useState(0);

    const [isError, setError] = useState(false);

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3();
            //console.log(web3);
            const loggedInAccount = await web3.eth.getAccounts();
            web3.eth.defaultAccount = loggedInAccount[0];
            const networkId = await web3.eth.net.getId();

            const tokenFactoryData = TokenFactory.networks[networkId];
            const token1Data = VINC.networks[networkId];
            const token2Data = VINC.networks[networkId];
            const tokenExchangeData = TokenExchange.networks[networkId];

            if (!tokenFactoryData  || !tokenExchangeData) {
                alert("Contracts not deployed on this network");
                throw new Error('Error');
            }

            const token1DeployerAddr = "0x44cccE6Da2023952fEB0aa8Eb620568D693aAAE1";
            const token2DeployerAddr = "0x3CC32e1D2e965C588F1bf41bB9b187F91BF94a44";

            // @important: Always change the address after migrations  
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, tokenFactoryData.address);
            const token1Addr = await tokenFactory.methods.tokensList(token1DeployerAddr).call();
            const token2Addr = await tokenFactory.methods.tokensList(token2DeployerAddr).call();
            const token1 = new web3.eth.Contract(VINC.abi, token1Addr);
            const token2 = new web3.eth.Contract(VINC.abi, token2Addr);

            const tokenExchange = new web3.eth.Contract(TokenExchange.abi, tokenExchangeData.address);

            const tokenExchangeAddr = tokenExchangeData.address;

            setWeb3(web3);
            setAccounts(loggedInAccount[0]);

            setTokenFactory(tokenFactory);
            setToken1(token1);
            setToken2(token2);
            setTokenExchange(tokenExchange);
            settokenExchangeAddr(tokenExchangeAddr);
            
            const owner1 = await token1.methods.owner().call();
            const owner2 = await token2.methods.owner().call();
            setOwner1(owner1);
            setOwner2(owner2);
            
            if(loggedInAccount[0]===owner1) {
                setSecondTraderAddr(owner2);
            } else if(loggedInAccount[0]===owner2) {
                setSecondTraderAddr(owner1);
            } else {
                setError(true);
                throw new Error("logged in person is not authorized");
            }

        }

        init();

        window.ethereum.on('accountsChanged', loginAcc => {
            setAccounts(loginAcc[0]);
        });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                

    }, []);

    const isReady = () => {
        return (
            typeof token1 !== 'undefined'
            && typeof token2 !== 'undefined'
            && typeof tokenExchange !== 'undefined'
            && typeof tokenFactory !== 'undefined'
            && typeof web3 !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof owner1 !== 'undefined'
            && typeof owner2 !== 'undefined'
        );
    }

    
    const getBalances = async () => {
    
        if(typeof loggedInAccount !== 'string' || typeof secondTraderAddr !== 'string') return;

        let yourToken1Balance = await token1.methods.balanceOf(loggedInAccount).call();
        let yourToken2Balance = await token2.methods.balanceOf(loggedInAccount).call();
        let recipientToken1Balance = await token1.methods.balanceOf(secondTraderAddr).call();
        let recipientToken2Balance = await token2.methods.balanceOf(secondTraderAddr).call();

        console.log(yourToken1Balance);
        console.log(yourToken2Balance);
        console.log(recipientToken1Balance);
        console.log(recipientToken2Balance);

        setLoggedInAccountToken1Balance(yourToken1Balance);
        setLoggedInAccountToken2Balance(yourToken2Balance);
        setRecipientToken1Balance(recipientToken1Balance);
        setRecipientToken2Balance(recipientToken2Balance);

        getCurrentAllowance();
        getCurrentExpectedReturningAmount();
    }

    const getCurrentAllowance = async () => {
        const getAllowance = await token1.methods
        .allowance(loggedInAccount, tokenExchangeAddr)
        .call();

        console.log(getAllowance);

        setCurrentSwapAllowance(getAllowance);
    }

    const approveTokens = (amount) => {
        token1.methods.approve(tokenExchangeAddr, amount).send({
            from: loggedInAccount
        }).on('receipt', async (receipt) => {
            console.log(receipt);
            getCurrentAllowance();
        })
            .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                console.error(error);
                console.log(receipt);
            });

    }

    const getCurrentExpectedReturningAmount = async () => {
        
        const expected_receiving_tokens = await token1.methods
        .expected_receiving_tokens(secondTraderAddr).call();

        console.log(expected_receiving_tokens);
        setCurrentExpectedReceivingAmount(expected_receiving_tokens);
    }

    const setExpectedReturningAmount = async (expectedAmount) => {
        await token1.methods.set_expected_receiving_tokens(secondTraderAddr, expectedAmount)
            .send({
                from: loggedInAccount
            })
            .on('transactionHash', async (hash) => {
                console.log(hash);
            })
            .on('receipt', async (receipt) => {
                console.log(receipt);
                getCurrentExpectedReturningAmount();
            })
            .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                console.error(error);
                console.log(receipt);
            });
    }

    const swapTokens = () => {

        if (currentSwapAllowance < 1 || currentExpectedReceivingAmount < 1) {
            alert("Your token amount cannot be less than 1.");
            return;
        }

        const yourTokenAmountToSend = Number(currentSwapAllowance);
        const receivingTokenAmount = Number(currentExpectedReceivingAmount);

        tokenExchange.methods
            .swap(loggedInAccount, yourTokenAmountToSend, secondTraderAddr, receivingTokenAmount)
            .send({ from: loggedInAccount })
            .on('receipt', async (receipt) => {
                console.log(receipt);
                getBalances();
            })
            .on('error', (e) => {
                console.log(e)
            });
    }

    const setSecondTrader = () => {
        
        const login = (typeof loggedInAccount=="string") ? loggedInAccount : loggedInAccount[0];

        if(login===owner1) {
            setSecondTraderAddr(owner2);
        } else if(login===owner2) {
            setSecondTraderAddr(owner1);
        } else {
            setError(true);
            throw new Error("logged in person is not authorized");
        }
    }

    useEffect(() => {
        if (isReady()) {
            web3.eth.defaultAccount = loggedInAccount;
            setSecondTrader();
            getBalances();
        }
    }, [loggedInAccount, secondTraderAddr, token1, token2, tokenExchange, web3]);

    if (!isReady()) {
        return "Loading...";
    } else if(isError) {
        return <div className="alert alert-danger" role="alert">Error</div>;
    } else {
        getBalances();
        return (
            <>
                <div className="container">
                    <div className="row">
                        <div className="col-sm">
                            <div className="alert alert-info" role="alert">logged In Account: {loggedInAccount}</div>
                            <div className="alert alert-info" role="alert">owner1: {owner1}</div>
                            <div className="alert alert-info" role="alert">owner2: {owner2}</div>
                            <div className="alert alert-info" role="alert">tokenExchangeAddr: {tokenExchangeAddr}</div>
                            <div className="alert alert-info" role="alert">Swap allowance for {tokenExchangeAddr}: {currentSwapAllowance}</div>
                        </div>
                        <div className="col-sm">
                            <div className="alert alert-info" role="alert">Expected Return from {owner2}: {currentExpectedReceivingAmount}</div>
                            <div className="alert alert-info" role="alert">loggedInAccountToken1Balance: {loggedInAccountToken1Balance}</div>
                            <div className="alert alert-info" role="alert">loggedInAccountToken2Balance: {loggedInAccountToken2Balance}</div>
                            <div className="alert alert-info" role="alert">recipientToken1Balance: {recipientToken1Balance}</div>
                            <div className="alert alert-info" role="alert">recipientToken2Balance: {recipientToken2Balance}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="mb-3">
                            <label htmlFor="allowanceExchangeAddr" className="form-label">Exchange address</label>
                            <input type="text" className="form-control" id="allowanceExchangeAddr"
                                value={tokenExchangeAddr}
                                onChange={(e) => setTokenExchange(e.target.value)}
                                aria-describedby="allowanceExchangeAddrHelp" disabled />
                            <div id="allowanceExchangeAddrHelp" className="form-text">This is the exchange address where tokens will be swapped.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="allowanceAmount" className="form-label">Allowance Amount</label>
                            <input type="number" className="form-control" id="allowanceAmount"
                                value={swapAllowance}
                                onChange={(e) => setSwapAllowance(Number(e.target.value))}
                            />
                        </div>

                        <button type="button" className="btn btn-primary"
                            onClick={() => approveTokens(swapAllowance)}
                        >Allow</button>

                        <button type="button" className="btn btn-primary"
                            onClick={async () => {
                                const getAllowance = await token1.methods
                                    .allowance(loggedInAccount, tokenExchangeAddr)
                                    .call();

                                    console.log(getAllowance);
    
                            }}> Get Approval</button>
                    </div>


                    <div className="row">
                        <div className="mb-3">
                            <label htmlFor="ExpRcvingAmtExchangeAddr" className="form-label">Exchange address</label>
                            <input type="text" className="form-control" id="ExpRcvingAmtExchangeAddr"
                                value={tokenExchangeAddr}
                                onChange={(e) => setTokenExchange(e.target.value)}
                                aria-describedby="ExpRcvingAmtExchangeAddrHelp" disabled />
                            <div id="ExpRcvingAmtExchangeAddrHelp" className="form-text">This is the exchange address where tokens will be swapped.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="ExpRcvingAmtAmount" className="form-label">Set Expected Receiving Amount</label>
                            <input type="number" className="form-control" id="ExpRcvingAmtAmount"
                                value={expectedReceivingAmount}
                                onChange={(e) => setExpectedReceivingAmount(Number(e.target.value))}
                            />
                        </div>

                        <button type="button" className="btn btn-primary"
                            onClick={() => setExpectedReturningAmount(expectedReceivingAmount)}
                        >Set Expected Returning Amount</button>

                        <button type="button" className="btn btn-primary"
                            onClick={async () => {
                                let getExpectedReturningAmount= await token1.methods
                                    .expected_receiving_tokens(secondTraderAddr)
                                    .call();

                                // getExpectedReturningAmount = web3.utils.fromWei(
                                //     getExpectedReturningAmount.toString(),
                                //     'Ether'
                                // );

                                console.log(getExpectedReturningAmount);
                            }}> Get Expected Returning Amount</button>
                    </div>

                    <div className="row">
                        <button type="button" className="btn btn-danger"
                            onClick={() => swapTokens()}
                        >SWAP</button>
                    </div>

                </div>
            </>
        )
    }
}

export default App;
