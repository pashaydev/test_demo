import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { connectors, getConnector } from './connectors';

const STORAGE_KEY = 'wallet.connector';

const ERROR_MESSAGES = {
  4001: 'Request rejected in wallet',
  '-32002': 'Request already pending — check your wallet',
};

const initialState = { status: 'disconnected', address: null, chainId: null, balance: null, error: null };

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [state, setState] = useState(initialState);
  const session = useRef(null); // { address, unsubscribe } for the active provider

  const teardown = useCallback(() => {
    session.current?.unsubscribe();
    session.current = null;
  }, []);

  const disconnect = useCallback(() => {
    teardown();
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, [teardown]);

  // Read account/chain/balance from an EIP-1193 provider and follow its changes.
  const activate = useCallback(
    async (provider, address) => {
      session.current?.unsubscribe();
      const web3 = new ethers.providers.Web3Provider(provider, 'any');

      const load = async (addr) => {
        session.current.address = addr;
        const [chainId, balance] = await Promise.all([
          provider.request({ method: 'eth_chainId' }),
          web3.getBalance(addr),
        ]);
        setState({ status: 'connected', address: addr, chainId: parseInt(chainId, 16), balance, error: null });
      };
      const onAccountsChanged = (accounts) => (accounts.length ? load(accounts[0]) : disconnect());
      const onChainChanged = () => load(session.current.address);

      provider.on('accountsChanged', onAccountsChanged);
      provider.on('chainChanged', onChainChanged);
      provider.on('disconnect', disconnect);
      session.current = {
        address,
        unsubscribe: () => {
          provider.removeListener('accountsChanged', onAccountsChanged);
          provider.removeListener('chainChanged', onChainChanged);
          provider.removeListener('disconnect', disconnect);
        },
      };
      await load(address);
    },
    [disconnect]
  );

  const connect = useCallback(
    async (connectorId = connectors[0].id) => {
      const connector = getConnector(connectorId);
      if (!connector?.isAvailable()) return;
      setState((s) => ({ ...s, status: 'connecting', error: null }));
      try {
        const provider = await connector.getProvider();
        const [address] = await provider.request({ method: 'eth_requestAccounts' });
        localStorage.setItem(STORAGE_KEY, connectorId);
        await activate(provider, address);
      } catch (err) {
        setState({ ...initialState, error: ERROR_MESSAGES[err.code] || err.message || 'Failed to connect' });
      }
    },
    [activate]
  );

  // Silently restore a previous session (no wallet popup) on page load.
  useEffect(() => {
    const connector = getConnector(localStorage.getItem(STORAGE_KEY));
    if (!connector?.isAvailable()) return undefined;
    let cancelled = false;
    (async () => {
      const provider = await connector.getProvider();
      const [address] = await provider.request({ method: 'eth_accounts' });
      if (address && !cancelled) await activate(provider, address);
    })().catch(() => {});
    return () => {
      cancelled = true;
      teardown();
    };
  }, [activate, teardown]);

  const available = connectors.some((c) => c.isAvailable());

  return (
    <WalletContext.Provider value={{ ...state, available, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
