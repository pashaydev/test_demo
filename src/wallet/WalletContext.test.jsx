import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider, useWallet } from './WalletContext';

const ADDRESS = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';

// EIP-1193 provider double: answers the RPC calls we use and lets tests emit events.
function makeProvider(overrides = {}) {
  const state = { accounts: [ADDRESS], chainId: '0xaa36a7', rejectRequest: null, ...overrides };
  const listeners = {};
  const provider = {
    state,
    listeners,
    request: jest.fn(async ({ method }) => {
      if (state.rejectRequest && method === 'eth_requestAccounts') throw state.rejectRequest;
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return state.accounts;
        case 'eth_chainId':
          return state.chainId;
        case 'eth_getBalance':
          return '0xde0b6b3a7640000'; // 1 ETH
        default:
          return null;
      }
    }),
    on: (event, cb) => {
      listeners[event] = cb;
    },
    removeListener: (event) => {
      delete listeners[event];
    },
    emit: (event, payload) => listeners[event]?.(payload),
  };
  return provider;
}

function Probe() {
  const w = useWallet();
  return (
    <div>
      <span data-testid="status">{w.status}</span>
      <span data-testid="address">{w.address ?? ''}</span>
      <span data-testid="chain">{w.chainId ?? ''}</span>
      <span data-testid="balance">{w.balance?.toString() ?? ''}</span>
      <span data-testid="error">{w.error ?? ''}</span>
      <span data-testid="available">{String(w.available)}</span>
      <button onClick={() => w.connect()}>connect</button>
      <button onClick={w.disconnect}>disconnect</button>
    </div>
  );
}

const renderWallet = () =>
  render(
    <WalletProvider>
      <Probe />
    </WalletProvider>
  );

const requestedMethods = (provider) => provider.request.mock.calls.map(([{ method }]) => method);

// connect()/disconnect() update state asynchronously — flush inside act().
const click = (text) => act(async () => userEvent.click(screen.getByText(text)));

beforeEach(() => {
  localStorage.clear();
  delete window.ethereum;
});

test('reports no wallet when nothing is injected', () => {
  renderWallet();
  expect(screen.getByTestId('available')).toHaveTextContent('false');
  expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
});

test('connect asks the wallet for accounts and exposes address, chain and balance', async () => {
  window.ethereum = makeProvider();
  renderWallet();

  await click('connect');

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('connected'));
  expect(screen.getByTestId('address')).toHaveTextContent(ADDRESS);
  expect(screen.getByTestId('chain')).toHaveTextContent('11155111');
  expect(screen.getByTestId('balance')).toHaveTextContent('1000000000000000000');
  expect(requestedMethods(window.ethereum)).toContain('eth_requestAccounts');
  // the session is remembered so a reload can restore it
  expect(localStorage.getItem('wallet.connector')).toBe('injected');
});

test('restores a remembered session on load without prompting the user', async () => {
  window.ethereum = makeProvider();
  localStorage.setItem('wallet.connector', 'injected');

  renderWallet();

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('connected'));
  const methods = requestedMethods(window.ethereum);
  expect(methods).toContain('eth_accounts');
  expect(methods).not.toContain('eth_requestAccounts'); // silent — no popup
});

test('does not restore a session the user disconnected', async () => {
  window.ethereum = makeProvider();
  localStorage.setItem('wallet.connector', 'injected');
  renderWallet();
  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('connected'));

  await click('disconnect');

  expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  expect(screen.getByTestId('address')).toHaveTextContent('');
  expect(localStorage.getItem('wallet.connector')).toBeNull();
  expect(Object.keys(window.ethereum.listeners)).toHaveLength(0);
});

test('follows account and chain changes from the wallet', async () => {
  window.ethereum = makeProvider();
  renderWallet();
  await click('connect');
  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('connected'));

  window.ethereum.state.accounts = [OTHER];
  await act(async () => window.ethereum.emit('accountsChanged', [OTHER]));
  await waitFor(() => expect(screen.getByTestId('address')).toHaveTextContent(OTHER));

  window.ethereum.state.chainId = '0x1';
  await act(async () => window.ethereum.emit('chainChanged', '0x1'));
  await waitFor(() => expect(screen.getByTestId('chain')).toHaveTextContent('1'));

  // wallet locked / all accounts revoked → we are disconnected
  await act(async () => window.ethereum.emit('accountsChanged', []));
  expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
});

test('shows a friendly message when the user rejects the request', async () => {
  window.ethereum = makeProvider({ rejectRequest: { code: 4001, message: 'User rejected the request.' } });
  renderWallet();

  await click('connect');

  await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Request rejected in wallet'));
  expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  expect(localStorage.getItem('wallet.connector')).toBeNull();
});
