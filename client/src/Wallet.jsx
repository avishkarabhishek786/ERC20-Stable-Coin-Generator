import React, {useState, useEffect, useReducer, useCallback} from 'react';
import  {Navbar, WalletUI}  from './Elems';
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import { getWeb3 } from "./utils";

const Wallet = () => {

    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [tokenOwnersList, setTokenOwnersList] = useState([]);
    const [tokenList, setTokenList] = useState([]);
    const [vinc, setVinc] = useState(undefined);
    const [isError, setIsError] = useState({
        state: false,
        msg: ""
    });

    const init = async () => {
        const web3 = await getWeb3();
        const loggedInAccount = await web3.eth.getAccounts();
        web3.eth.defaultAccount = loggedInAccount[0];
        setWeb3(web3);
        setAccounts(loggedInAccount[0]);
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        const tokenFactoryData = TokenFactory.networks[networkId];
        if (!tokenFactoryData) {
            setIsError({
                state: true,
                msg: "Token Factory Contract not deployed on this network"
            });
            throw new Error('Error');
        }
        const tokenFactory = new web3.eth.Contract(TokenFactory.abi, tokenFactoryData.address);
        setTokenFactory(tokenFactory);

        const getTokenOwnersAddresses = await tokenFactory.methods.getTokensOwnersList().call();
        console.log(getTokenOwnersAddresses);
        setTokenOwnersList(getTokenOwnersAddresses);
    }

    useEffect(() => {
        init();

        window.ethereum.on('accountsChanged', loginAcc => {
            setAccounts(loginAcc[0]);
            unsetStates();
        });

    }, []);

    const isReady = useCallback(() => {
        return (
            typeof web3 !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof tokenFactory !== 'undefined'
            && isError.state !== true
        )
    }, [web3, loggedInAccount, tokenFactory]);

    const unsetStates = () => {
        //
    }

    const walletQuery = {
        userAddr: "",
        tokenAddress: ""
    }

    if(!isReady()) {
        return "loading.."
    } else {
        return (
            <>
                {tokenOwnersList.map(ownersAddrs=>{
                    console.log(ownersAddrs);
                })}
            </>
        )
    }

    const getTOkenBalance = (state, action) => {
        switch (action.type) {
            case "increment1":
                return { ...state, firstCounterValue: state.firstCounterValue + action.value };
            case "decrement1":
                return { ...state, firstCounterValue: state.firstCounterValue - action.value };
            case "increment5":
                return { ...state, secondCounterValue: state.secondCounterValue + action.value};
            case "decrement5":
                return { ...state, secondCounterValue: state.secondCounterValue - action.value};
            case "reset":
                return walletQuery;
    
            default:
                return state;
        }
    }
    
    const CounterObj = () => {
        
        const [count, dispatch] = useReducer(getTOkenBalance, walletQuery);
        return (
            <>
                <p>firstCounterValue: {count.firstCounterValue}</p>
                <p>secondCounterValue: {count.secondCounterValue}</p>
               
                <button onClick={() => { dispatch({ type: "increment1", value:1 }) }}>Increment</button>
                <button onClick={() => { dispatch({ type: "decrement1", value:1  }) }}>Decrement</button>
    
                <button onClick={() => { dispatch({ type: "increment5", value:5 }) }}>Increment 5</button>
                <button onClick={() => { dispatch({ type: "decrement5", value:5  }) }}>Decrement 5</button>
    
                <button onClick={() => { dispatch({ type: "reset" }) }}>Reset</button>
            </>
        );
    }
    


}

export default Wallet;