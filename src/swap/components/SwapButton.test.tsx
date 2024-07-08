/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwapButton } from './SwapButton';
import { useSwapContext } from './SwapProvider';

jest.mock('./SwapProvider', () => ({
  useSwapContext: jest.fn(),
}));

jest.mock('../../internal/loading/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

const useSwapContextMock = useSwapContext as jest.Mock;

describe('SwapButton', () => {
  const mockHandleSubmit = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockHandleSubmit.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders button with text "Swap" when not loading', () => {
    useSwapContextMock.mockReturnValue({
      to: { loading: false, amount: 1, token: 'ETH' },
      from: { loading: false, amount: 1, token: 'BTC' },
      loading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<SwapButton onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId('ockSwapButton_Button');
    expect(button).toHaveTextContent('Swap');
    expect(button).not.toBeDisabled();
  });

  it('renders Spinner when loading', () => {
    useSwapContextMock.mockReturnValue({
      to: { loading: true, amount: 1, token: 'ETH' },
      from: { loading: false, amount: 1, token: 'BTC' },
      loading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<SwapButton onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId('ockSwapButton_Button');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('button is disabled when required fields are missing', () => {
    useSwapContextMock.mockReturnValue({
      to: { loading: false, amount: 1, token: 'ETH' },
      from: { loading: false, amount: null, token: 'BTC' },
      loading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<SwapButton onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId('ockSwapButton_Button');
    expect(button).toBeDisabled();
  });

  it('applies additional className correctly', () => {
    useSwapContextMock.mockReturnValue({
      to: { loading: false, amount: 1, token: 'ETH' },
      from: { loading: false, amount: 1, token: 'BTC' },
      loading: false,
      handleSubmit: mockHandleSubmit,
    });

    const customClass = 'custom-class';
    render(<SwapButton className={customClass} onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId('ockSwapButton_Button');
    expect(button).toHaveClass(customClass);
  });
});
