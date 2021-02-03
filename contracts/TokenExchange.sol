// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './EDGECOIN.sol';

contract TokenExchange {
    
    string public name = 'ERC20 Tokens Instant Exchange';
 
    event TokensPurchased(
        EDGECOIN coin,
        address sender,
        address recipient,
        uint amount
    );
        
    function _safeTransferFrom(
        EDGECOIN token,
        address sender,
        address recipient,
        uint amount
     ) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "Token transfer failed");
        emit TokensPurchased(token, sender, recipient, amount);
     }
     
     function swap(address owner1, EDGECOIN token_1, uint amount1, address owner2, EDGECOIN token_2, uint amount2) external {
        require(msg.sender == owner1 || msg.sender == owner2, "Not authorized");
        require(owner1 != address(0) || owner2 != address(0), "Swapping to the zero address");
        require(amount1 > 0 || amount2 > 0, "Swapping to zero amount");
        
        require(
            EDGECOIN(token_1).balanceOf(owner1) >= amount1,
            "Insufficient token1 balance."
        );
        require(
            EDGECOIN(token_2).balanceOf(owner2) >= amount2,
            "Insufficient token2 balance."
        );
        
        require(
            EDGECOIN(token_1).allowance(owner1, address(this)) >= amount1,
            "Token 1 allowance too low"
        );
        require(
            EDGECOIN(token_2).allowance(owner2, address(this)) >= amount2,
            "Token 2 allowance too low"
        );
        
        require(
            EDGECOIN(token_2).expected_receiving_tokens(owner1, owner2) == amount2,
            "Token 2 expected amount too low"
        );

        require(
            EDGECOIN(token_1).expected_receiving_tokens(owner2, owner1) == amount1,
            "Token 1 expected amount too low"
        );
        
        _safeTransferFrom(token_1, owner1, owner2, amount1);
        _safeTransferFrom(token_2, owner2, owner1, amount2);
        
     }
       
}