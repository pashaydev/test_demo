import { FaWallet } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useWallet } from '../../wallet/WalletContext';
import { chainInfo, formatBalance, shortAddress } from '../../wallet/format';

// Single connect/status control used by the Navbar and the Home CTA.
// `className` carries the call site's button styling.
function WalletButton({ className }) {
  const { status, address, chainId, balance, error, available, connect, disconnect } = useWallet();

  if (!available) {
    return (
      <a className={className} href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
        <FaWallet className="mr-2" />
        Install wallet
      </a>
    );
  }

  if (status === 'connected') {
    const chain = chainInfo(chainId);
    return (
      <button
        type="button"
        className={className}
        onClick={disconnect}
        title={`${address} on ${chain.name} — click to disconnect`}
      >
        <FaWallet className="mr-2" />
        {shortAddress(address)} · {formatBalance(balance)} {chain.symbol}
        <span className="hidden lg:inline">&nbsp;· {chain.name}</span>
        <FiLogOut className="ml-2" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${className} disabled:opacity-60`}
        onClick={() => connect()}
        disabled={status === 'connecting'}
      >
        <FaWallet className="mr-2" />
        {status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && (
        <span className="ml-2 text-xs text-red-500" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export default WalletButton;
