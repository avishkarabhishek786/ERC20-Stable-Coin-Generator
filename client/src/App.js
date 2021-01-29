import React from 'react';
import {Routes, Route} from "react-router-dom";
import Home from "./Home";
import NewToken from "./NewToken";
import Swap from "./Swap";
import Wallet from "./Wallet";
import Paypal from "./Paypal";
import RedeemCash from "./RedeemCash";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/new_token" element={<NewToken />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/buy" element={<Paypal />} />
            <Route path="/redeem_cash" element={<RedeemCash />} />
            <Route path="*" element={<Home />} />
        </Routes>
    )
}

export default App;