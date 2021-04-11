import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders OrderBook', () => {
  const { getByTestId } = render(<App />);

  expect(getByTestId('order-book')).toBeInTheDocument();
});
