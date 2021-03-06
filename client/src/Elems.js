import React, {useState, useEffect, useRef} from 'react';
import { Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

export const Navbar = () => {
    return (
        <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
            <Link className="navbar-brand" to="#">EDGE STABLE COIN</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/home">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/new_token">Create New Token</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/swap">Swap Tokens</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/wallet">Wallet</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/buy">Buy Tokens</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/redeem_cash">Redeem Cash</Link>
                </li>
            </ul>
            </div>
        </div>
        </nav>
        <ToastContainer
            position="top-right"
            autoClose={15000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
        </>
    )
}

export const InfoData = (props) => {
    return (
        <>
            <div className="col-sm">
                <div className="alert alert-info" role="alert">logged In Account: {props.loggedInAccount}</div>
                <div className="alert alert-info" role="alert">Second Trader: {props.secondTraderAddr}</div>
                <div className="alert alert-info" role="alert">tokenExchangeAddr: {props.tokenExchangeAddr}</div>
                <div className="alert alert-info" role="alert">Swap allowance for {props.tokenExchangeAddr}: {props.currentSwapAllowance}</div>
            </div>
            <div className="col-sm">
                <div className="alert alert-info" role="alert">Expected Return from {props.secondTraderAddr}: {props.currentExpectedReceivingAmount}</div>
                <div className="alert alert-info" role="alert">Your Selling Token ({props.sellingTokenName}) balance: {props.loggedInAccountToken1Balance}</div>
                <div className="alert alert-info" role="alert">Your Buying Token ({props.buyingTokenName}) balance: {props.loggedInAccountToken2Balance}</div>
                <div className="alert alert-info" role="alert">Recipient Selling Token ({props.buyingTokenName}) balance: {props.recipientToken2Balance}</div>
                <div className="alert alert-info" role="alert">Recipient Buying Token ({props.sellingTokenName}) balance: {props.recipientToken1Balance}</div>
            </div>
        </>
    )
}

export const ChangeSecondTraderAddress = (props) => {
    return (
        <>
            <div className="center_div">
            <div className="card bg-light mb-3" style={{"max-width": "40rem"}}>
                <div className="card-header">
                Enter address of the trader you want to trade with
                </div>
                <div className="card-body">
                    <input type="text"
                        id="changeSecondTraderAddressId"
                        className="form-control ip-element"
                        placeholder="Second trader address"
                        value={props.currentSecondTrader}
                        onChange={(e) => { props.changeSecondTraderAddr(e.target.value); }}
                    />
                    <button type="button" className="btn btn-primary" 
                    onClick={() => {
                        props.setSecondTrader();
                    }}>Click</button>
                </div>
            </div>
            </div>
        </>
    )
}

export const ChangeTokens = (props) => {
    return (
        <>
            <div className="container">
            <div className="card d-flex justify-content-center mg-top">
                <div className="card-body">
                <input type="text"
                    className="form-control ip-element"
                    placeholder="Enter token address"
                    value={props.currentSecondTrader}
                    onChange={(e) => { props.changeSecondTraderAddr(e.target.value); }}
                />
                <button type="button" 
                className="btn btn-primary" 
                onClick={() => {
                    props.setSecondTrader();
                }}>Click</button>
                </div>
            </div>
            </div>
        </>
    )
}

export const SetTokensToSwap = (props) => {
    return (
        <>
            <div className="center_div">
            <div className="card bg-light d-flex justify-content-center mg-top">
                <div className="card-header">Carefully Provide Selling and Buying Token Address</div>
                <div className="card-body">
                <input type="text"
                className="form-control ip-element"
                placeholder="SELLING token address"
                value={props.currentSellingTokenAddress || ''}
                onChange={(e) => { props.editSellingTokenAddress(e.target.value) }}
            />
            <input type="text"
                className="form-control ip-element"
                placeholder="BUYING token address"
                value={props.currentBuyingTokenAddress || ''}
                onChange={(e) => { props.editBuyingTokenAddress(e.target.value) }}
            />
            <button className="btn btn-primary"type="button" 
            onClick={() => props.updateTokenAddrs()}>Click</button>
                </div>        
            </div>
            </div>
        </>
    )

}

export const NewTokenUI = (props) => {
    return (
        <>
            <div className="card d-flex justify-content-center mg-top">
            <div className="card-header">
                Provide the details of your new Token
            </div>
            <div className="card-body">
            <form onSubmit={props.submitNewToken}>
                <div className="mb-3">
                    <label htmlFor="newTokenName" className="form-label">Token Name</label>
                    <input type="text" className="form-control" id="newTokenName" aria-describedby="sta"
                        value={props.newTokenName} 
                        name="newTokenName"
                        onChange={(e)=>props.updateNewTokenData(e)}
                    />
                    <div id="sta" className="form-text">Enter the fullname of your new token.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="newTokenSymbol" className="form-label">Token Symbol</label>
                    <input type="text" className="form-control" id="newTokenSymbol" aria-describedby="bta" 
                        value={props.newTokenSymbol}
                        name="newTokenSymbol"
                        onChange={(e)=>props.updateNewTokenData(e)}
                    />
                    <div id="bta" className="form-text">Enter the 3 capital character symbol of the token you are creating.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="newTokenInitialSupply" className="form-label">Initial Supply</label>
                    <input type="text" className="form-control" id="newTokenInitialSupply" aria-describedby="ista" 
                        value={props.newTokenInitialSupply}
                        name="newTokenInitialSupply"
                        onChange={(e)=>props.updateNewTokenData(e)}
                    />
                    <div id="bta" className="form-text">Enter the initail supply of the new token.</div>
                </div>
                <button type="submit" className="btn btn-primary">Create</button>
            </form>
            </div>
            </div>
        </>
    )
}

export const WalletUI = (props) => {
    return (
        <>
            <p>Wallet</p>
        </>
    );
};

export const PaypalUI = (props) => {

    const [numberOfTokens, setNumberOfTokens] = useState(0);
    const [paid, setPaid] = React.useState(false);
    const [error, setError] = React.useState(null);

    const paypalBtn = useRef();

    useEffect(()=>{
        window.paypal.Buttons({
            createOrder: function(data, actions) {
              // This function sets up the details of the transaction, including the amount and line item details.
              return actions.order.create({
                intent:"CAPTURE",  
                purchase_units: [{
                  description: "Enter USD amount to buy EDGE stable coin",  
                  amount: {
                    currency_code: "USD",  
                    value: document.getElementById("numberOfTokensIp").value
                  }
                }]
              });
            },
            onApprove: function(data, actions) {
              // This function captures the funds from the transaction.
              return actions.order.capture().then(function(details) {
                // This function shows a transaction success message to your buyer.
                console.log(details);   
                setPaid(true);
                props.sendPurchaseDetailToCashier(details);
                //alert('Transaction completed by ' + details.payer.name.given_name);
              });
            },
            onError: function(err) {
                console.log(err);
                setError(err);
            }
          }).render(paypalBtn.current);
    }, []);

      // If the payment has been made
        if (paid) {
            return <div>Payment successful.!</div>;
        }

        // If any error occurs
        if (error) {
            return <div>Error Occurred in processing payment.! Please try again.</div>;
        }

    return (
        <>
            <div className="card d-flex justify-content-center mg-top">
                <div className="card-header">
                    Checkout to purchase EDGE stable coins.
            </div>
                <p>You are buying {numberOfTokens} EDGE tokens.</p>
                <input type="text" className="form form-control" 
                id="numberOfTokensIp"
                value={numberOfTokens}
                onChange={(e)=>{
                    setNumberOfTokens(e.target.value);
                }} />
                <div className="card-body">
                    <div ref={paypalBtn} />
                </div>
            </div>
        </>
    );
};
