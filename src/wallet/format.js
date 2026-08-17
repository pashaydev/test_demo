import { ethers } from 'ethers';

const CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH' },
  10: { name: 'Optimism', symbol: 'ETH' },
  56: { name: 'BNB Chain', symbol: 'BNB' },
  137: { name: 'Polygon', symbol: 'MATIC' },
  8453: { name: 'Base', symbol: 'ETH' },
  42161: { name: 'Arbitrum', symbol: 'ETH' },
  11155111: { name: 'Sepolia', symbol: 'ETH' },
};

export const chainInfo = (chainId) => CHAINS[chainId] || { name: `Chain ${chainId}`, symbol: 'ETH' };

export const shortAddress = (address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const formatBalance = (wei) => Number(ethers.utils.formatEther(wei)).toFixed(4);
