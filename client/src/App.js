import React, { useState, useEffect } from 'react';
import VINC from "./abis/VINC.json";
import TokenExchange from "./abis/TokenExchange.json";
import { getWeb3 } from "./utils";

const App = () => {
    const [web3, setWeb3] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [token1, setToken1] = useState(undefined);
    const [token2, setToken2] = useState(undefined);
    const [owner1, setOwner1] = useState(undefined);
    const [owner2, setOwner2] = useState(undefined);
    const [tokenExchange, setTokenExchange] = useState(undefined);
    const [tokenExchangeAddr, settokenExchangeAddr] = useState(undefined);
    const [swapAllowance, setSwapAllowance] = useState(0);
    const [expectedReceivingAmount, setExpectedReceivingAmount] = useState(0);
    const [loggedInAccountToken1Balance, setLoggedInAccountToken1Balance] = useState(0);
    const [loggedInAccountToken2Balance, setLoggedInAccountToken2Balance] = useState(0);
    const [recipientToken1Balance, setRecipientToken1Balance] = useState(0);
    const [recipientToken2Balance, setRecipientToken2Balance] = useState(0);

    useEffect(()=>{
        const init = async () => {
            const web3 = await getWeb3();
            const loggedInAccount = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();

            const token1Data = VINC.networks[networkId];
            const token2Data = VINC.networks[networkId];
            const tokenExchangeData = TokenExchange.networks[networkId];

            if(!token1Data || !token2Data || !tokenExchangeData) {
                alert("Contracts not deployed on this network");
                throw new Error('Error');
            }

            // @important: Always change the address after migrations  
            const token1 = new web3.eth.Contract(VINC.abi, "0xc9b09312E13c1E8ceC7c753F4d6d715d6eF133ce");
            const token2 = new web3.eth.Contract(VINC.abi, "0xfebdEc048b638C5703b8F9E4464e34A3a95c7163");
            // const token1 = new web3.eth.Contract(VINC.abi, token1Data.address);
            // const token2 = new web3.eth.Contract(VINC.abi, token2Data.address);
            const tokenExchange = new web3.eth.Contract(TokenExchange.abi, tokenExchangeData.address);

            
            const tokenExchangeAddr = tokenExchangeData.address;
            
            setWeb3(web3);
            setAccounts(loggedInAccount[0]);
            setToken1(token1);
            setToken2(token2);
            setTokenExchange(tokenExchange);
            settokenExchangeAddr(tokenExchangeAddr);

            const owner1 = await token1.methods.owner().call();
            const owner2 = await token2.methods.owner().call();
            setOwner1(owner1);
            setOwner2(owner2);
            
        }

        init();
        window.ethereum.on('accountsChanged', loggedInAccount => {
            setAccounts(loggedInAccount[0]);
        });

    }, []);

    const isReady = () => {
        return (
          typeof token1 !== 'undefined' 
          && typeof token2 !== 'undefined'
          && typeof tokenExchange !== 'undefined'
          && typeof web3 !== 'undefined'
          && typeof loggedInAccount !== 'undefined'
          && typeof owner1 !== 'undefined'
          && typeof owner2 !== 'undefined'
        );
    }

    const getBalances = async ()=>{
        let yourToken1Balance = await token1.methods.balanceOf(loggedInAccount).call();
        let yourToken2Balance = await token2.methods.balanceOf(loggedInAccount).call();
        let recipientToken1Balance = await token1.methods.balanceOf(owner2).call();
        let recipientToken2Balance = await token2.methods.balanceOf(owner2).call();

        console.log(yourToken1Balance);
        console.log(yourToken2Balance);
        console.log(recipientToken1Balance);
        console.log(recipientToken2Balance);

        setLoggedInAccountToken1Balance(yourToken1Balance);
        setLoggedInAccountToken2Balance(yourToken2Balance);
        setRecipientToken1Balance(recipientToken1Balance);
        setRecipientToken2Balance(recipientToken2Balance);
    }

    const approveTokens = async (amount)=> {
        await token1.methods.approve(tokenExchangeAddr, amount).send({
            from: loggedInAccount
        }).on('transactionHash', async (hash) => {
            const getAllowance = Number(await token1.methods
                                .allowance(loggedInAccount, tokenExchangeAddr)
                                .call());
    
            console.log(getAllowance);
            
            setSwapAllowance(getAllowance);
        });

    }

    const setExpectedReturningAmount = async (expectedAmount) => {
        await token1.methods.set_expected_receiving_tokens(owner2, expectedAmount)
        .send({
            from: loggedInAccount
        })
        .on('transactionHash', async (hash) => {
            const expected_receiving_tokens = Number(await token1.methods
            .expected_receiving_tokens(owner2));
    
            console.log(expected_receiving_tokens);
            setExpectedReceivingAmount(expected_receiving_tokens);
        });
    }

    const swapTokens = () => {
        tokenExchange.methods
        .swap(loggedInAccount, 50, owner2, 50)
        .send({from: loggedInAccount})
        .on('transactionHash', async (hash) => {
            console.log(hash);
            getBalances();
        });
    }

    useEffect(() => {
        if(isReady()) {
            getBalances();
        }
      }, [loggedInAccount, token1, token2, tokenExchange, web3]);

    if(!isReady()) {
        return "Loading...";
    } else {
        getBalances();
        return (
            <>
                <p>logged In Account: {loggedInAccount}</p>
                <p>owner1: {owner1}</p>
                <p>owner2: {owner2}</p>
                <p>tokenExchangeAddr: {tokenExchangeAddr}</p>
                <p>Swap allowance for {tokenExchangeAddr}: {swapAllowance}</p>
                <p>Expected Return from {owner2}: {expectedReceivingAmount}</p>
                <p>loggedInAccountToken1Balance: {loggedInAccountToken1Balance}</p>
                <p>loggedInAccountToken2Balance: {loggedInAccountToken2Balance}</p>
                <p>recipientToken1Balance: {recipientToken1Balance}</p>
                <p>recipientToken2Balance: {recipientToken2Balance}</p>
            </>
        )
    }
}

export default App;
