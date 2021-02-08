import React, {useState, useEffect, useCallback} from 'react';
import  {Navbar, NewTokenUI, showMessage}  from './Elems';
import EDGECOIN from "./abis/EDGECOIN.json";
import TokenFactory from "./abis/TokenFactory.json";
import { getWeb3 } from "./utils";

const NewToken = () => {

    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [EDGECOIN, setEDGECOIN] = useState(undefined);
    const [isError, setIsError] = useState({
        state: false,
        msg: ""
    });

    const init = async () => {
        const web3 = await getWeb3();
        const loggedInAccount = await web3.eth.getAccounts();
        console.log(loggedInAccount);
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

    const [newTokenData, setNewTokenData] = useState({
        newTokenName: "",
        newTokenSymbol: "", 
        newTokenInitialSupply: "",
    });

    const updateNewTokenData = (e) => {
        const { name, value } = e.target;
        
        setNewTokenData(prev=>{
            return {
                ...prev,
                [name]: value,
            }
        });
    }

    const submitNewToken = async (e) => {
        e.preventDefault();
        
        let {newTokenName, newTokenSymbol, newTokenInitialSupply} = newTokenData;
        console.log(newTokenName, newTokenSymbol, newTokenInitialSupply);
        if(typeof newTokenName == "string" && newTokenName.length >1
        && typeof newTokenSymbol == "string" && newTokenSymbol.length===3
        && typeof newTokenInitialSupply == "string" && newTokenInitialSupply>=1000) {
            
            setIsError({
                state: false,
                msg: ""
            });

            newTokenInitialSupply = web3.utils.toWei(newTokenInitialSupply.toString(), 'Ether');

            await tokenFactory.methods.createToken(newTokenName, newTokenSymbol, newTokenInitialSupply)
            .send({
                from: loggedInAccount
            })
            .on('transactionHash', async (hash) => {
                console.log(hash);
                setIsError({
                    state: false,
                    msg: ""
                });
            })
            .on('receipt', async (receipt) => {
                console.log(receipt);
                const newTokenAddress = await tokenFactory.methods.tokensList(loggedInAccount).call();
                console.log(newTokenAddress);
                showMessage(`Token created at address: ${newTokenAddress}`, true);
            })
            .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                console.error(error);
                console.log(receipt);
                setIsError({
                    state: true,
                    msg: "Failed to create new token"
                });
            });

        } else {
            setIsError({
                state: true,
                msg: "Invalid token credentials"
            });
        }
    }

    if(!isReady()) {
        return (
            <>
                <Navbar />
                {(isError.state && isError.msg) ? 
                <div className="alert alert-danger" role="alert">{isError.msg}</div> : ""}
                <p>Loading...</p>
            </>
        )
    } else {
        
        return (
            <>
                <Navbar />
                {(isError.state && isError.msg) ? 
                <div className="alert alert-danger" role="alert">{isError.msg}</div> : ""}

                <div className="container">
                    <NewTokenUI
                        newTokenName={newTokenData.newTokenName}
                        newTokenSymbol={newTokenData.newTokenSymbol}
                        newTokenInitialSupply={newTokenData.newTokenInitialSupply}
                        updateNewTokenData={updateNewTokenData}
                        submitNewToken={submitNewToken}
                    />
                </div>
            </>
        );
    }

}

export default NewToken;
