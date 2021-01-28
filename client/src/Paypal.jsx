import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './Elems';
import "./index.css";
import VINC from "./abis/VINC.json";
import TokenFactory from "./abis/TokenFactory.json";
import { getWeb3 } from "./utils";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        setVinc(undefined);
    }

    //const [checkout, setCheckout] = useState(false);

    const sendPurchaseDetailToCashier = (puchase_data) => {
        // Simple POST request with a JSON body using fetch
        if (!web3.utils.isAddress(loggedInAccount)) {
            setIsError({
                state: true,
                msg: "Invalid logged in account address: " + loggedInAccount
            });
            return false;
        }
        puchase_data.purchaser_eth_address = loggedInAccount;
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

    const showMessage = (msg = '', success = true) => {
        const options = {
            position: "top-right",
            autoClose: 15000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        }
            if (success === true) {
                toast.success(msg, options)
            } else {
                toast.error(msg, options)
            }
    };

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
