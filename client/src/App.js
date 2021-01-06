import React, { useState, useEffect } from 'react';
import VINC from "./abis/VINC.json";
import TokenExchange from "./abis/TokenExchange.json";
import { getWeb3 } from "./utils";

const App = () => {
    const [web3, setWeb3] = useState(undefined);
    const [accounts, setAccounts] = useState(undefined);
    const [token1, setToken1] = useState(undefined);
    const [token2, setToken2] = useState(undefined);
    const [owner1, setOwner1] = useState(undefined);
    const [owner2, setOwner2] = useState(undefined);
    const [tokenExchange, setTokenExchange] = useState(undefined);
    const [tokenExchangeAddr, settokenExchangeAddr] = useState(undefined);

    useEffect(()=>{
        const init = async () => {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();

            const token1Data = VINC.networks[networkId];
            const token2Data = VINC.networks[networkId];
            const tokenExchangeData = TokenExchange.networks[networkId];

            if(!token1Data || !token2Data || !tokenExchangeData) {
                alert("Contracts not deployed on this network");
                throw new Error('Error');
            }

            // @important: Always change the address after migrations  
            const token1 = new web3.eth.Contract(VINC.abi, "0xCDD97951ED1b0eBA46941B9e155E92Fb157010D9");
            const token2 = new web3.eth.Contract(VINC.abi, "0xFCb464233f35F1a64F88AC4caA58b0e883133589");
            // const token1 = new web3.eth.Contract(VINC.abi, token1Data.address);
            // const token2 = new web3.eth.Contract(VINC.abi, token2Data.address);
            const tokenExchange = new web3.eth.Contract(TokenExchange.abi, tokenExchangeData.address);

            const owner1 = await token1.methods.owner().call();
            const owner2 = await token2.methods.owner().call();

            const tokenExchangeAddr = tokenExchangeData.address;

            setWeb3(web3);
            setAccounts(accounts);
            setToken1(token1);
            setToken2(token2);
            setTokenExchange(tokenExchange);
            settokenExchangeAddr(tokenExchangeAddr);
            setOwner1(owner1);
            setOwner2(owner2);

        }

        init();
        window.ethereum.on('accountsChanged', accounts => {
            setAccounts(accounts);
        });

    }, []);

    const isReady = () => {
        return (
          typeof token1 !== 'undefined' 
          && typeof token2 !== 'undefined'
          && typeof tokenExchange !== 'undefined'
          && typeof web3 !== 'undefined'
          && typeof accounts !== 'undefined'
          && typeof owner1 !== 'undefined'
          && typeof owner2 !== 'undefined'
        );
    }

    if(!isReady) {
        return "Loading...";
    } else {
        return (
            <>
                <p>accounts: {accounts}</p>
                <p>owner1: {owner1}</p>
                <p>owner2: {owner2}</p>
                <p>tokenExchangeAddr: {tokenExchangeAddr}</p>
            </>
        )
    }
}

export default App;
