import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, showMessage } from './Elems';
import "./index.css";
import EDGECOIN from "./abis/EDGECOIN.json";
import TokenFactory from "./abis/TokenFactory.json";
import { getWeb3 } from "./utils";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
const abi = require('ethereumjs-abi');

const Paypal = () => {

    const BUYING_TOKEN_ADDRESS = "0xed9213701834d12516d49d2df88f1da32b6c1723";

    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [tokenFactory, setTokenFactory] = useState(undefined);
    const [edgeCoin, setEDGECOIN] = useState(undefined);
    const [isError, setIsError] = useState({
        state: false,
        msg: ""
    });

    const [numberOfTokens, setNumberOfTokens] = useState(0);
    const [paid, setPaid] = useState(false);
    const [tokenPurchased, setTokenPurchased] = useState({
        status: false,
        tx: ""
    });

    const paypalBtn = useRef();

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

        const edgeCoin = new web3.eth.Contract(EDGECOIN.abi, BUYING_TOKEN_ADDRESS);
        setEDGECOIN(edgeCoin);
    }

    useEffect(() => {
        init();

        window.ethereum.on('accountsChanged', loginAcc => {
            console.log(loginAcc);
            setAccounts(loginAcc[0]);
            unsetStates();
        });

    }, []);

    const isReady = useCallback(() => {
        return (
            typeof web3 !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof tokenFactory !== 'undefined'
            && typeof edgeCoin !== 'undefined'
            && isError.state !== true
        )
    }, [web3, loggedInAccount, tokenFactory, edgeCoin]);

    useEffect(() => {
        console.log(isReady());
        console.log(loggedInAccount);
        if (!isReady()) return;
        window.paypal.Buttons({
            createOrder: function (data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [{
                        description: "Enter USD amount to buy EDGE stable coin",
                        amount: {
                            currency_code: "USD",
                            value: document.getElementById("numberOfTokensIp").value
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function (details) {
                    // This function shows a transaction success message to your buyer.
                    console.log(details);
                    setPaid(true);
                    return sendPurchaseDetailToCashier(details);
                    //alert('Transaction completed by ' + details.payer.name.given_name);
                });
            },
            onError: function (err) {
                console.log(err);
                setIsError({
                    state: true,
                    msg: err
                });
            }
        }).render(paypalBtn.current);
    }, [isReady])

    const unsetStates = () => {
        setEDGECOIN(undefined);
    }

    const signOrder = async (numberOfTokens, nonce) => {
        
        if(!isReady()) return null;
        if(typeof BUYING_TOKEN_ADDRESS !== "string" || BUYING_TOKEN_ADDRESS.length<1) {
            return console.warn("BUYING_TOKEN_ADDRESS not set");
        }

        numberOfTokens = parseInt(numberOfTokens).toString();

        // for correct verification in contract convert number of tokens in wei
        const numberOfTokensInWei = web3.utils.toWei(numberOfTokens,"ether");

          let sha3hash = web3.utils.soliditySha3(
              {type: 'address', value: loggedInAccount},
              {type: 'uint256', value: numberOfTokensInWei},
              {type: 'address', value: BUYING_TOKEN_ADDRESS},
              {type: 'uint64', value: nonce}
          );
          console.log(loggedInAccount);
          console.log(numberOfTokensInWei);
          console.log(BUYING_TOKEN_ADDRESS);
          console.log(sha3hash);
          console.log(nonce);
        
        const signature = web3.eth.sign(sha3hash, loggedInAccount);
        console.log(signature);
        return signature;

    }

    //const [checkout, setCheckout] = useState(false);

    const sendPurchaseDetailToCashier = async (puchase_data) => {
        // Simple POST request with a JSON body using fetch
        if (!web3.utils.isAddress(loggedInAccount)) {
            setIsError({
                state: true,
                msg: "Invalid logged in account address: " + loggedInAccount
            });
            return false;
        }

        let amout_of_tokens = puchase_data.purchase_units[0].amount["value"];

        // Get nonce
        const nonce = await edgeCoin.methods.getNonce(0, loggedInAccount).call();

        const buyerSignature = await signOrder(amout_of_tokens, nonce);
        console.log(buyerSignature);
        if(typeof buyerSignature !== "string" || buyerSignature.length<1) {
            setIsError({
                state: true,
                msg: "Invalid signature: " + buyerSignature
            });
            return false;
        }

        puchase_data.purchaser_eth_address = loggedInAccount;
        puchase_data.buyer_signature = buyerSignature;
        puchase_data.nonce = nonce;

        console.log(puchase_data);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puchase_data })
        };
        
        fetch('http://localhost:8073/contractFunction/fiat_buy', requestOptions)
            .then(response => response.json())
            .then(cashier_response => {
                console.log(cashier_response);
                if (typeof cashier_response == "object" && cashier_response.res_code !== "0") {

                    // Process refund of cash back to buyer
                    setIsError({
                        state: true,
                        msg: cashier_response.res_message
                    });

                } else {
                    
                    showMessage(`${cashier_response.res_message} Tx hash: ${cashier_response.data}`, true);
                    setTokenPurchased({
                        status: true,
                        tx: cashier_response.data
                    });
                }
            });
    }

    // If the payment has been made
    if (paid) {
        showMessage("Payment successful.!", true);
    }

    // If any error occurs
    if (isError.state) {
        console.warn(isError.msg);
        showMessage(isError.msg, false);
        showMessage("Error Occurred in processing payment.! Please try again.", false);
        return (
            <div>
                <p>Error Occurred in processing payment.! Please try again</p>
            </div>
        )
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="Paypal">
                    
                        <div className="card d-flex justify-content-center mg-top">
                        {
                            (tokenPurchased.status) ? 
                            <div className="card-body">
                                <h5><i>Token purchase successful!!</i></h5>
                                <h3>{tokenPurchased.tx}</h3>
                            </div> : ""
                        }
                        <div className="card-header">
                            Checkout to purchase EDGE stable coins.
                            </div>
                        <p>You are buying {numberOfTokens} EDGE tokens.</p>
                        <input type="text" className="form form-control"
                            id="numberOfTokensIp"
                            value={numberOfTokens}
                            onChange={(e) => {
                                setNumberOfTokens(e.target.value);
                            }} />
                        <div className="card-body">
                            <div ref={paypalBtn} />
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
            </div>
        </>
    )

}

export default Paypal;
