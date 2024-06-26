/**
 * @jest-environment jsdom
 */
import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectWallet } from './ConnectWallet';
import { useAccount, useConnect } from 'wagmi';
import { useWalletContext } from './WalletProvider';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
}));

jest.mock('../../identity/components/IdentityProvider', () => ({
  IdentityProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('./WalletProvider', () => ({
  useWalletContext: jest.fn(),
  WalletProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('ConnectWallet', () => {
  beforeEach(() => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '',
      status: 'disconnected',
    });
    (useConnect as jest.Mock).mockReturnValue({
      connectors: [{ id: 'mockConnector' }],
      connect: jest.fn(),
      status: 'idle',
    });
    (useWalletContext as jest.Mock).mockReturnValue({
      isOpen: false,
      setIsOpen: jest.fn(),
    });
  });

  test('renders connect button when disconnected', () => {
    render(<ConnectWallet label="Connect Wallet" />);

    const button = screen.getByTestId('ockConnectWallet_ConnectButton');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Connect Wallet');
  });

  test('renders spinner when loading', () => {
    (useConnect as jest.Mock).mockReturnValue({
      connectors: [{ id: 'mockConnector' }],
      connect: jest.fn(),
      status: 'pending',
    });
    (useAccount as jest.Mock).mockReturnValue({
      address: '',
      status: 'connecting',
    });

    render(<ConnectWallet label="Connect Wallet" />);

    const spinner = screen.getByTestId('ockSpinner');
    expect(spinner).toBeInTheDocument();
  });

  test('renders children when connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      status: 'connected',
    });

    render(
      <ConnectWallet label="Connect Wallet">
        <div>Wallet Connected</div>
      </ConnectWallet>,
    );

    const connectedText = screen.getByText('Wallet Connected');
    expect(connectedText).toBeInTheDocument();
  });

  test('calls connect function when connect button is clicked', () => {
    const connectMock = jest.fn();
    (useConnect as jest.Mock).mockReturnValue({
      connectors: [{ id: 'mockConnector' }],
      connect: connectMock,
      status: 'idle',
    });

    render(<ConnectWallet label="Connect Wallet" />);

    const button = screen.getByTestId('ockConnectWallet_ConnectButton');
    fireEvent.click(button);

    expect(connectMock).toHaveBeenCalledWith({
      connector: { id: 'mockConnector' },
    });
  });

  test('toggles wallet modal on button click when connected', () => {
    const setIsOpenMock = jest.fn();
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      status: 'connected',
    });
    (useWalletContext as jest.Mock).mockReturnValue({
      isOpen: false,
      setIsOpen: setIsOpenMock,
    });

    render(
      <ConnectWallet label="Connect Wallet">
        <div>Wallet Connected</div>
      </ConnectWallet>,
    );

    const button = screen.getByText('Wallet Connected');
    fireEvent.click(button);

    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });
});