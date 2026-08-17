// Browser-injected EIP-1193 provider (MetaMask, OKX, Trust, Rabby, ...).
export const injected = {
  id: 'injected',
  name: 'Browser wallet',
  isAvailable: () => typeof window !== 'undefined' && !!window.ethereum,
  getProvider: async () => window.ethereum,
};
