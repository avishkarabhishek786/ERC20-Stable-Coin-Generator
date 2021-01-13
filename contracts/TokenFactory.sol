// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './VINC.sol';

contract TokenFactory {

    //VINC[] public tokensList;
    mapping(address=>VINC) public tokensList;

    function createToken(string memory _name, string memory _symbol, uint256 _initialSupply) public payable {
        require(address(tokensList[msg.sender])==address(0), "A token already exists with sender's address.");
        VINC newToken = (new VINC){value:msg.value}(_name, _symbol, _initialSupply);
        //tokensList.push(newToken);
        tokensList[msg.sender] = newToken;
    }

}