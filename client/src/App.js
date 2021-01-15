import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, InfoData, ChangeSecondTraderAddress } from './Elems';
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import TokenExchange from "./abis/TokenExchange.json";
import { getWeb3 } from "./utils";

const App = () => {
    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [editSecondTraderAddr, setEditSecondTraderAddr] = useState(undefined);
    const [secondTraderAddr, setSecondTraderAddr] = useState(undefined);
    const [token1, setToken1] = useState(undefined);
    const [token2, setToken2] = useState(undefined);
    const [token1Name, setToken1Name] = useState(undefined);
    const [token2Name, setToken2Name] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [tokenExchange, setTokenExchange] = useState(undefined);
    const [tokenExchangeAddr, setTokenExchangeAddr] = useState(undefined);
    const [swapAllowance, setSwapAllowance] = useState(0);
    const [currentSwapAllowance, setCurrentSwapAllowance] = useState(0);
    const [expectedReceivingAmount, setExpectedReceivingAmount] = useState(0);
    const [currentExpectedReceivingAmount, setCurrentExpectedReceivingAmount] = useState(0);
    const [loggedInAccountToken1Balance, setLoggedInAccountToken1Balance] = useState(0);
    const [loggedInAccountToken2Balance, setLoggedInAccountToken2Balance] = useState(0);
    const [recipientToken1Balance, setRecipientToken1Balance] = useState(0);
    const [recipientToken2Balance, setRecipientToken2Balance] = useState(0);
    const [token_addr1, setToken_addr1] = useState(undefined);
    const [token_addr2, setToken_addr2] = useState(undefined);
    
    const [isError, setError] = useState(false);

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3();
            const loggedInAccount = await web3.eth.getAccounts();
            web3.eth.defaultAccount = loggedInAccount[0];
            setWeb3(web3);
            setAccounts(loggedInAccount[0]);
            const networkId = await web3.eth.net.getId();
            setNetworkId(networkId);

            const tokenFactoryData = TokenFactory.networks[networkId];
            const tokenExchangeData = TokenExchange.networks[networkId];

            if (!tokenFactoryData || !tokenExchangeData) {
                alert("Contracts not deployed on this network");
                throw new Error('Error');
            }
            
            const tokenFactory = new web3.eth.Contract(TokenFactory.abi, tokenFactoryData.address);
            setTokenFactory(tokenFactory);

            const tokenExchange = new web3.eth.Contract(TokenExchange.abi, tokenExchangeData.address);

            const tokenExchangeAddr = tokenExchangeData.address;

            setTokenExchange(tokenExchange);
            setTokenExchangeAddr(tokenExchangeAddr);

        }

        init();

        window.ethereum.on('accountsChanged', loginAcc => {
            console.log("account changed");
            setAccounts(loginAcc[0]);
            setSecondTraderAddr(undefined);
        });

    }, []);

    useEffect(() => {
        
        if(web3===undefined) return;
        
        let tk_addr1 = localStorage.getItem("token_addr1"); 
        let tk_addr2 = localStorage.getItem("token_addr2");

        if(typeof tk_addr1 == "string" && tk_addr1.length>0
        && tk_addr1 !== "null" && tk_addr1 !== "undefined") {
            setToken_addr1(tk_addr1);
            localStorage.setItem("token_addr1", tk_addr1);
        } else {
            tk_addr1 = prompt("Enter Token 1 address");
            setToken_addr1(tk_addr1);
            localStorage.setItem("token_addr1", tk_addr1);
        }
        if(typeof tk_addr2 == "string" && tk_addr2.length>0
        && tk_addr2 !== "null" && tk_addr2 !== "undefined") {
            setToken_addr2(tk_addr2);
            localStorage.setItem("token_addr2", tk_addr2);
        } else {
            tk_addr2 = prompt("Enter Token 2 address");
            setToken_addr2(tk_addr2);
            localStorage.setItem("token_addr2", tk_addr2);
        }

        (async ()=>{
            const token1 = new web3.eth.Contract(VINC.abi, tk_addr1);
            const token2 = new web3.eth.Contract(VINC.abi, tk_addr2);
            setToken1(token1);
            setToken2(token2);
            const token1_name = await token1.methods.name().call();
            const token2_name = await token2.methods.name().call();
            setToken1Name(token1_name);
            setToken2Name(token2_name);
        })()

    }, [token_addr1, token_addr2, web3]);

    const isReady = useCallback(() => {
        // console.log(token1);
        // console.log(token2);
        // console.log(tokenExchange);
        // console.log(tokenFactory);
        // console.log(web3);
        // console.log(loggedInAccount);
        // console.log("secondTraderAddr", secondTraderAddr);
        return (
            typeof token1 !== 'undefined'
            && typeof token2 !== 'undefined'
            && typeof tokenExchange !== 'undefined'
            && typeof tokenFactory !== 'undefined'
            && typeof web3 !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof secondTraderAddr !== 'undefined'
        );
    }, [
        token1, 
        token2,
        tokenExchange, 
        tokenFactory, 
        web3,
        loggedInAccount, 
        secondTraderAddr
    ]);

    const getBalances = useCallback(async () => {

        if (typeof loggedInAccount !== 'string' || typeof secondTraderAddr !== 'string') return;

        let yourToken1Balance = await token1.methods.balanceOf(loggedInAccount).call();
        let yourToken2Balance = await token2.methods.balanceOf(loggedInAccount).call();
        let recipientToken1Balance = await token1.methods.balanceOf(secondTraderAddr).call();
        let recipientToken2Balance = await token2.methods.balanceOf(secondTraderAddr).call();

        setLoggedInAccountToken1Balance(yourToken1Balance);
        setLoggedInAccountToken2Balance(yourToken2Balance);
        setRecipientToken1Balance(recipientToken1Balance);
        setRecipientToken2Balance(recipientToken2Balance);

        getCurrentAllowance();
        getCurrentExpectedReturningAmount();
    }, [loggedInAccount, secondTraderAddr]);

    const getCurrentAllowance = async () => {
        const getAllowance = await token1.methods
            .allowance(loggedInAccount, tokenExchangeAddr)
            .call();

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

        const exp_receiving_tokens = await token2.methods
            .expected_receiving_tokens(loggedInAccount, secondTraderAddr).call();

        setCurrentExpectedReceivingAmount(exp_receiving_tokens);
    }

    const setExpectedReturningAmount = async (expectedAmount) => {
        await token2.methods.set_expected_receiving_tokens(secondTraderAddr, expectedAmount)
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

    const swapTokens = async () => {

        if (currentSwapAllowance < 1 || currentExpectedReceivingAmount < 1) {
            alert("Your token amount cannot be less than 1.");
            return;
        }

        const yourTokenAmountToSend = Number(currentSwapAllowance);
        const receivingTokenAmount = Number(currentExpectedReceivingAmount);

        //return console.log(token_addr1, token_addr2);
        //console.log(loggedInAccount, token1, yourTokenAmountToSend, secondTraderAddr, token2, receivingTokenAmount);

        //console.log(tokenExchange);
        //console.log(tokenExchange.methods.swap);

        // let _name = await tokenExchange.methods.name().call();
        // console.log(_name);

        // return;
        tokenExchange.methods
            .swap(loggedInAccount, token_addr1, yourTokenAmountToSend, secondTraderAddr, token_addr2, receivingTokenAmount)
            .send({ from: loggedInAccount })
            .on('receipt', async (receipt) => {
                console.log(receipt);
                getBalances();
            })
            .on('error', (e) => {
                console.log(e)
            });
    }

    const setSecondTrader = async() => {
        console.log(editSecondTraderAddr);
        setSecondTraderAddr(editSecondTraderAddr);
        console.log(isReady());
    };    
    
    const changeSecondTraderAddr = async(new_trader_addr) => {
        console.log(new_trader_addr);
        setEditSecondTraderAddr(old=>old=new_trader_addr);
        console.log(editSecondTraderAddr);
    };

    if (isError) {
        return <div className="alert alert-danger" role="alert">Error</div>;
    } 
    else if(typeof secondTraderAddr !== "string" || secondTraderAddr.length<1) {
        return <ChangeSecondTraderAddress 
                currentSecondTrader={secondTraderAddr} 
                setSecondTrader={setSecondTrader} 
                changeSecondTraderAddr={changeSecondTraderAddr} 
                />;
    } 
    // else if(!token1 || !token2) {
    //     return setTokensToSwap();
    //} 
    else if (!isReady()) {
        return "Loading...";
    } else {
        // console.log(token1);
        // console.log(token2);
        // return console.log(isReady());
        getBalances();
        return (
            <>
                <Navbar />

                <div className="container">
                    <div className="row mt-3 mb-1">
                        <InfoData
                            loggedInAccount={loggedInAccount}
                            secondTraderAddr={secondTraderAddr}
                            tokenExchangeAddr={tokenExchangeAddr}
                            currentSwapAllowance={currentSwapAllowance}
                            currentExpectedReceivingAmount={currentExpectedReceivingAmount}
                            loggedInAccountToken1Balance={loggedInAccountToken1Balance}
                            loggedInAccountToken2Balance={loggedInAccountToken2Balance}
                            recipientToken1Balance={recipientToken1Balance}
                            recipientToken2Balance={recipientToken2Balance}
                        />
                    </div>
                    <div className="card mt-1 mb-1">
                        <div className="card-body">
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

                            <button type="button" className="btn btn-primary mr-2"
                                onClick={() => approveTokens(swapAllowance)}
                            >Allow</button>

                            <button type="button" className="btn btn-primary mr-2"
                                onClick={async () => {
                                    const getAllowance = await token1.methods
                                        .allowance(loggedInAccount, tokenExchangeAddr)
                                        .call();

                                    console.log(getAllowance);

                                }}> Get Approval</button>
                        </div>
                    </div>


                    <div className="card mt-1 mb-1">
                        <div className="card-body">
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

                            <button type="button" className="btn btn-primary mr-2"
                                onClick={() => setExpectedReturningAmount(expectedReceivingAmount)}
                            >Set Expected Returning Amount</button>

                            <button type="button" className="btn btn-primary mr-2"
                                onClick={async () => {
                                    let getExpectedReturningAmount = await token2.methods
                                        .expected_receiving_tokens(loggedInAccount, secondTraderAddr)
                                        .call();

                                    // getExpectedReturningAmount = web3.utils.fromWei(
                                    //     getExpectedReturningAmount.toString(),
                                    //     'Ether'
                                    // );

                                    console.log(token2);

                                    console.log(getExpectedReturningAmount);
                                }}> Get Expected Returning Amount</button>
                        </div>
                    </div>

                    <div className="card mt-1 mb-1">
                        <div className="card-header">
                            Swap Tokens
                        </div>
                        <div className="card-body">
                            <p>Buy {token2Name} for {token1Name}</p>    
                            <button type="button" className="btn btn-danger mr-2"
                                onClick={() => swapTokens()}
                            >SWAP</button>
                        </div>
                    </div>


                            <button type="button" className="btn btn-primary mr-2"
                                onClick={async () => {
                                    let towner1 = await token1.methods
                                        .owner()
                                        .call();

                                    console.log(towner1);
                                }}> Token owner 1</button>

                            <button type="button" className="btn btn-primary mr-2"
                                onClick={async () => {
                                    let towner2 = await token2.methods
                                        .owner()
                                        .call();

                                    console.log(towner2);
                                }}>  Token owner 2</button>

                </div>
            </>
        )
    }
}

export default App;
