import React, {useState, useEffect, useCallback} from 'react';
import  {Navbar, PaypalUI}  from './Elems';
import "./index.css";
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import { getWeb3 } from "./utils";

const Paypal = () => {

    const BUYING_TOKEN_ADDRESS = "";

    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [vinc, setVinc] = useState(undefined);
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

        const buyingToken = new web3.eth.Contract(VINC.abi, BUYING_TOKEN_ADDRESS);
        setVinc(buyingToken);
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
        setVinc(undefined);
    }

    const [checkout, setCheckout] = useState(false);

    const sendPurchaseDetailToCashier = (puchase_data) => {
        // Simple POST request with a JSON body using fetch
        puchase_data.purchaser_eth_address = loggedInAccount;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puchase_data })
        };
        fetch('http://localhost:8073/contractFunction/fiat_buy', requestOptions)
            .then(response => response.json())
            .then(data => console.log(data));
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="Paypal">
                    {checkout ?
                        <PaypalUI 
                            sendPurchaseDetailToCashier={sendPurchaseDetailToCashier}
                        />
                        :
                        <button type="button" onClick={() => setCheckout(true)} >
                        Checkout
                        </button>
                    }
                </div>
            </div>
        </>
    )

}

export default Paypal;
