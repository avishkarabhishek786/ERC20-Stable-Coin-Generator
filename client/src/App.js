import React from 'react';
import {Routes, Route} from "react-router-dom";
import Home from "./Home";
import NewToken from "./NewToken";
import Swap from "./Swap";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/new_token" element={<NewToken />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="*" element={<Home />} />
        </Routes>
    )
}

export default App;