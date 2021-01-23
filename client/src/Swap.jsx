import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, InfoData, ChangeSecondTraderAddress, SetTokensToSwap } from './Elems';
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import TokenExchange from "./abis/TokenExchange.json";
import { getWeb3 } from "./utils";

const Swap = () => {
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
            setAccounts(loginAcc[0]);
            unsetStates();
        });

    }, []);

    const isReady = useCallback(() => {
        console.log(token1);
        console.log(token2);
        console.log(tokenExchange);
        console.log(tokenFactory);
        console.log(web3);
        console.log(loggedInAccount);
        console.log("secondTraderAddr", secondTraderAddr);
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

    // Unset everything after account change
    const unsetStates = useCallback(() => {
        setToken1(undefined);
        setToken2(undefined);
        setToken1Name(undefined);
        setToken2Name(undefined);
        setSecondTraderAddr(undefined);
        setToken_addr1(undefined);
        setToken_addr2(undefined);
        localStorage.setItem("token_addr1", "");
        localStorage.setItem("token_addr2", "");
    }, []);

    const getBalances = useCallback(async () => {

        if (!isReady() || typeof loggedInAccount !== 'string' || typeof secondTraderAddr !== 'string') return;

        console.log(isReady());
        console.log(token1);

        let yourToken1Balance = web3.utils.fromWei(await token1.methods.balanceOf(loggedInAccount).call(), 'Ether');
        let yourToken2Balance = web3.utils.fromWei(await token2.methods.balanceOf(loggedInAccount).call(), 'Ether');
        let recipientToken1Balance = web3.utils.fromWei(await token1.methods.balanceOf(secondTraderAddr).call(), 'Ether');
        let recipientToken2Balance = web3.utils.fromWei(await token2.methods.balanceOf(secondTraderAddr).call(), 'Ether');

        setLoggedInAccountToken1Balance(yourToken1Balance);
        setLoggedInAccountToken2Balance(yourToken2Balance);
        setRecipientToken1Balance(recipientToken1Balance);
        setRecipientToken2Balance(recipientToken2Balance);

        getCurrentAllowance();
        getCurrentExpectedReturningAmount();
    }, [loggedInAccount, secondTraderAddr, isReady]);

    const getCurrentAllowance = async () => {
        const getAllowance = web3.utils.fromWei(await token1.methods
            .allowance(loggedInAccount, tokenExchangeAddr)
            .call(), 'Ether');

        setCurrentSwapAllowance(getAllowance);
    }

    const approveTokens = (amount) => {
        amount = web3.utils.toWei(amount.toString(), 'Ether');
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

        const exp_receiving_tokens = web3.utils.fromWei(await token2.methods
            .expected_receiving_tokens(loggedInAccount, secondTraderAddr).call(), 'Ether');

        setCurrentExpectedReceivingAmount(exp_receiving_tokens);
    }

    const setExpectedReturningAmount = async (expectedAmount) => {
        
        expectedAmount = web3.utils.toWei(expectedAmount.toString(), 'Ether');
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

        const yourTokenAmountToSend = web3.utils.toWei(currentSwapAllowance.toString(), 'Ether');
        const receivingTokenAmount = web3.utils.toWei(currentExpectedReceivingAmount.toString(), 'Ether');

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
        if(editSecondTraderAddr.toLowerCase()===loggedInAccount.toLowerCase()) {
            setError("Buyer and seller cannot be same");
            return false;
        }
        setSecondTraderAddr(editSecondTraderAddr);
    };    
    
    const changeSecondTraderAddr = async(new_trader_addr) => {
        setEditSecondTraderAddr(old=>old=new_trader_addr);
    };

    if (isError) {
        return (
            <>
                <Navbar /> 
                <div className="alert alert-danger" role="alert">Error</div>;
            </>
        )
    } else if(typeof secondTraderAddr !== "string" || secondTraderAddr.length<1) {
     
        return (
            <>
                <Navbar /> 
                <ChangeSecondTraderAddress 
                currentSecondTrader={secondTraderAddr} 
                setSecondTrader={setSecondTrader} 
                changeSecondTraderAddr={changeSecondTraderAddr} 
                />;
            </> );
    } else if(!token1 || !token2) {
        
        if(web3===undefined) return;
        
        let tk_addr1 = localStorage.getItem("token_addr1"); 
        let tk_addr2 = localStorage.getItem("token_addr2");
        
        const editSellingTokenAddress = (val) => {
            console.log(val);
            setToken_addr1(val);
        }

        const editBuyingTokenAddress = (val) => {
            console.log(val);
            setToken_addr2(val);
        }

        const updateTokenAddrs = async () => {
            console.log(token_addr1, token_addr2);
            const token1 = new web3.eth.Contract(VINC.abi, token_addr1);
            const token2 = new web3.eth.Contract(VINC.abi, token_addr2);
            setToken1(token1);
            setToken2(token2);
            localStorage.setItem("token_addr1", token_addr1);
            localStorage.setItem("token_addr2", token_addr2);

            const token_1 = new web3.eth.Contract(VINC.abi, token_addr1);
            const token_2 = new web3.eth.Contract(VINC.abi, token_addr2);
            setToken1(token_1);
            setToken2(token_2);
            const token1_name = await token1.methods.name().call();
            const token2_name = await token2.methods.name().call();
            console.log(token1_name);
            setToken1Name(token1_name);
            setToken2Name(token2_name);
        }
        if(typeof tk_addr1 !== "string" || tk_addr1.length==0
        || tk_addr1 == "null" || tk_addr1 == "undefined"
        || typeof tk_addr2 !== "string" || tk_addr2.length==0
        || tk_addr2 == "null" || tk_addr2 == "undefined") {

            console.log("SetTokensToSwap");

            
            return (
                <>
                    <Navbar /><SetTokensToSwap 
                currentSellingTokenAddress={token_addr1}
                currentBuyingTokenAddress={token_addr2}
                editSellingTokenAddress={editSellingTokenAddress}
                editBuyingTokenAddress={editBuyingTokenAddress}
                updateTokenAddrs={updateTokenAddrs}
            />
            </>)
        } else {
            localStorage.setItem("token_addr1", undefined); 
            localStorage.setItem("token_addr2", undefined);
            return (
                <>
                    <Navbar />
                    <SetTokensToSwap 
                    currentSellingTokenAddress={token_addr1}
                    currentBuyingTokenAddress={token_addr2}
                    editSellingTokenAddress={editSellingTokenAddress}
                    editBuyingTokenAddress={editBuyingTokenAddress}
                    updateTokenAddrs={updateTokenAddrs}/>
                </>
            )
        
        }
    } 
    else if (!isReady()) {
        return (
            <>
                <Navbar />
                <p>Loading...</p>
            </>
        );
    } 
    else {
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
                            sellingTokenName={token1Name}
                            buyingTokenName={token2Name}
                        />
                    </div>
                    <div className="card mt-1 mb-1">
                    <div className="card-header">Set how much token you want to send</div>
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
                                    let getAllowance = await token1.methods
                                        .allowance(loggedInAccount, tokenExchangeAddr)
                                        .call();

                                        getAllowance = web3.utils.fromWei(
                                            getAllowance.toString(),
                                        'Ether'
                                    );

                                    console.log(getAllowance);

                                }}> Get Approval</button>
                        </div>
                    </div>


                    <div className="card mt-1 mb-1">
                    <div className="card-header">Set how much token you want to receive</div>
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

                                    getExpectedReturningAmount = web3.utils.fromWei(
                                        getExpectedReturningAmount.toString(),
                                        'Ether'
                                    );

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

                </div>
            </>
        )
    }
}

export default Swap;
