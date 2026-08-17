import { injected } from './injected';

// A connector is `{ id, name, isAvailable(): boolean, getProvider(): Promise<EIP1193Provider> }`.
// To support another wallet (WalletConnect, Coinbase, ...) add a file returning
// its EIP-1193 provider and list it here — WalletContext needs no changes.
export const connectors = [injected];

export const getConnector = (id) => connectors.find((c) => c.id === id);
