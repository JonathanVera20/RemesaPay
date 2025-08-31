// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Simple mock USDC contract for testing purposes
 * Anyone can mint tokens for testing
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        _decimals = 6; // USDC has 6 decimals
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint tokens to any address (for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in USDC units, not wei)
     */
    function mint(address to, uint256 amount) public {
        // Convert amount to proper decimals (USDC has 6 decimals)
        uint256 amountWithDecimals = amount * 10**_decimals;
        _mint(to, amountWithDecimals);
    }
    
    /**
     * @dev Mint tokens to caller (easy minting)
     * @param amount Amount of tokens to mint (in USDC units)
     */
    function mintToSelf(uint256 amount) public {
        mint(msg.sender, amount);
    }
    
    /**
     * @dev Faucet function - gives 1000 USDC to caller
     */
    function faucet() public {
        mint(msg.sender, 1000); // Mint 1000 USDC
    }
}
