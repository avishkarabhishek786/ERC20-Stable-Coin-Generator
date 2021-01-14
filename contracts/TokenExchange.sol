// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './VINC.sol';

contract TokenExchange {
    
    VINC public token1;
    VINC public token2;
    
    string public name = 'ERC20 Tokens Instant Exchange';
 
    event TokensPurchased(
        VINC coin,
        address sender,
        address recipient,
        uint amount
    );
    
    constructor(VINC _token1, VINC _token2) public {
        token1 = _token1;
        token2 = _token2;
    }

    function setTokensToSwap(VINC _token1, VINC _token2) public {
        token1 = _token1; // your/caller's token
        token2 = _token2; // second party's token
    }
    
    function _safeTransferFrom(
        VINC token,
        address sender,
        address recipient,
        uint amount
     ) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "Token transfer failed");
        emit TokensPurchased(token, sender, recipient, amount);
     }
     
     function swap(address owner1, uint amount1, address owner2, uint amount2) external {
        require(msg.sender == owner1 || msg.sender == owner2, "Not authorized");
        require(owner1 != address(0) || owner2 != address(0), "Swapping to the zero address");
        require(amount1 > 0 || amount2 > 0, "Swapping to zero amount");
        require(
            token1.allowance(owner1, address(this)) >= amount1,
            "Token 1 allowance too low"
        );
        require(
            token2.allowance(owner2, address(this)) >= amount2,
            "Token 2 allowance too low"
        );
        
        require(
            token1.expected_receiving_tokens(owner2) == amount1,
            "Token 1 expected amount too low"
        );

        require(
            token2.expected_receiving_tokens(owner1) == amount2,
            "Token 2 expected amount too low"
        );
        
        _safeTransferFrom(token1, owner1, owner2, amount1);
        _safeTransferFrom(token2, owner2, owner1, amount2);
        
     }
       
}