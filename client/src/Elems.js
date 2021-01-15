import React from 'react';

export const Navbar = () => {
    return (
        <nav className="navbar navbar-light bg-light">
            <span className="navbar-brand mb-0 h1">Navbar</span>
        </nav>
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
                <div className="alert alert-info" role="alert">loggedInAccountToken1Balance: {props.loggedInAccountToken1Balance}</div>
                <div className="alert alert-info" role="alert">loggedInAccountToken2Balance: {props.loggedInAccountToken2Balance}</div>
                <div className="alert alert-info" role="alert">recipientToken1Balance: {props.recipientToken1Balance}</div>
                <div className="alert alert-info" role="alert">recipientToken2Balance: {props.recipientToken2Balance}</div>
            </div>
        </>
    )
}

export const ChangeSecondTraderAddress = (props) => {
    return (
        <>
            <div>
                <input type="text" 
                    placeholder="Second trader address"
                    value={props.currentSecondTrader} 
                    onChange={(e)=>{props.changeSecondTraderAddr(e.target.value);}}
                 />
                <button type="button" onClick={()=>{
                    props.setSecondTrader();
                }}>Click</button>
            </div>
        </>
    )
}

export const ChangeTokens = (props) => {
    return (
        <>
            <div>
                <input type="text" 
                    placeholder="Enter token address"
                    value={props.currentSecondTrader} 
                    onChange={(e)=>{props.changeSecondTraderAddr(e.target.value);}}
                 />
                <button type="button" onClick={()=>{
                    props.setSecondTrader();
                }}>Click</button>
            </div>
        </>
    )
}
