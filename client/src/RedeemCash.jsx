import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './Elems';
import "./index.css";
import { getWeb3 } from "./utils";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RedeemCash = () => {

    const SELLING_TOKEN_ADDRESS = "0x0dea6892e73e38a2854e8aF4983AFdf67615a93d";

    const [web3, setWeb3] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [isError, setIsError] = useState({
        state: false,
        msg: ""
    });
    const [numberOfTokens, setNumberOfTokens] = useState(0);
    const [paypalEmail, setPaypalEmail] = useState(undefined);

    const init = async () => {
        const web3 = await getWeb3();
        const loggedInAccount = await web3.eth.getAccounts();
        console.log(loggedInAccount);
        web3.eth.defaultAccount = loggedInAccount[0];
        setWeb3(web3);
        setAccounts(loggedInAccount[0]);
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
            && isError.state !== true
        )
    }, [web3, loggedInAccount]);

    useEffect(() => {
        console.log(isReady());
        console.log(loggedInAccount);
        if (!isReady()) return;
        
    }, [isReady])

    const unsetStates = () => {

    }

    const signOrder = useCallback((numberOfTokens) => {
        console.log(isReady());
        if(!isReady()) return;
        if(typeof SELLING_TOKEN_ADDRESS !== "string" || SELLING_TOKEN_ADDRESS.length<1) {
            return console.warn("SELLING_TOKEN_ADDRESS not set");
        }

        numberOfTokens = parseInt(numberOfTokens).toString();

        // for correct verification in contract convert number of tokens in wei
        const numberOfTokensInWei = web3.utils.toWei(numberOfTokens,"ether");

          let sha3hash = web3.utils.soliditySha3(
              {type: 'address', value: loggedInAccount},
              {type: 'uint256', value: numberOfTokensInWei},
              {type: 'address', value: SELLING_TOKEN_ADDRESS}
          );
          console.log(loggedInAccount);
          console.log(numberOfTokens);
          console.log(SELLING_TOKEN_ADDRESS);
          console.log(sha3hash);
        
        const signature = web3.eth.sign(sha3hash, loggedInAccount);
        console.log(signature);
        return signature;

    }, [isReady]);

    const sendRedeemCashRequest = async(e) => {
        
        e.preventDefault();
        const sellingTokenAmount = Number(document.getElementById('numberOfTokensIp').value);
        const payPalEmail = document.getElementById('paypalEmailIp').value;

        if(typeof loggedInAccount !== "string" || loggedInAccount.length !== 42) {
            showMessage("User not logged in", false);
            return;
        }

        if(typeof sellingTokenAmount !== "number" || sellingTokenAmount<1
        || payPalEmail.length<1) {
            showMessage("Invalid inputs", false);
            return;
        } 

        const sellerSignature = await signOrder(sellingTokenAmount);

        const redeem_data = {
            sellingTokenAmount, 
            payPalEmail, 
            redeemerEthAddr: loggedInAccount,
            sellerSignature: sellerSignature
        };

        console.log(redeem_data);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ redeem_data })
        };
        
        fetch('http://localhost:8073/contractFunction/fiat_redeem', requestOptions)
            .then(response => response.json())
            .then(cashier_response => {
                console.log(cashier_response);
                if (typeof cashier_response == "object" && cashier_response.res_code !== "0") {

                    // Process refund of cash back to buyer
                    setIsError({
                        state: true,
                        msg: cashier_response.res_message
                    });

                    showMessage(`${cashier_response.res_message}`, false);

                } else {
                    
                    showMessage(`${cashier_response.res_message} Tx hash: ${cashier_response.data}`, true);
                    // setCashRedeem({
                    //     status: true,
                    //     tx: cashier_response.data
                    // });


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
                            
                        }
                        <div className="card-header">
                            Enter your paypal id or email to sell EDGE stable coins and receive cash back
                            to your paypal account.
                            </div>
                        
                        <div className="card-body">
                            <p>You are selling {numberOfTokens} EDGE tokens.</p>
                            <input type="text" className="form form-control"
                                id="numberOfTokensIp"
                                value={numberOfTokens}
                                onChange={(e) => {
                                    setNumberOfTokens(e.target.value);
                                }} />
                            <input type="text" 
                                id="paypalEmailIp"
                                className="form form-control" 
                                value={paypalEmail || ""}
                                onChange={(e) => {
                                    setPaypalEmail(e.target.value)
                                }}
                            />    

                            <input type="submit" className="btn btn-primary"
                            onClick={(e)=>{sendRedeemCashRequest(e)}
                            } />
                        </div>
                    </div>
        
                </div>
            </div>
        </>
    )

}

export default RedeemCash;
