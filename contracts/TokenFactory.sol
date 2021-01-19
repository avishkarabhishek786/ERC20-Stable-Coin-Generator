// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './VINC.sol';

contract TokenFactory {

    uint tokenOwnerCount=0;
    mapping(uint=>address) public tokenOwners;
    mapping(address=>VINC) public tokensList;

    function createToken(string memory _name, string memory _symbol, uint256 _initialSupply) public payable {
        // todo: check for already existing token symbol as well
        require(address(tokensList[msg.sender])==address(0), "A token already exists with sender's address.");
        VINC newToken = (new VINC){value:msg.value}(_name, _symbol, _initialSupply);
        tokenOwners[tokenOwnerCount] = msg.sender;
        tokenOwnerCount++;
        tokensList[msg.sender] = newToken;
    }

    function getTokensOwnersList() public view returns (address[] memory) {
        address[] memory tol = new address[](tokenOwnerCount);
        for(uint i=0; i<tokenOwnerCount; i++) {
            tol[i] = tokenOwners[i];
        }
        return tol;
    }

}