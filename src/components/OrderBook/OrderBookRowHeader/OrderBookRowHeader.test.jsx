import React from 'react';
import { render } from '@testing-library/react';
import OrderBookRowHeader from './OrderBookRowHeader';

describe('OrderBookRowHeader', () => {
  it('should display the header in sequential order', () => {
    const { getByTestId } = render(
      <OrderBookRowHeader />,
    );

    expect(getByTestId('row-header-column-1')).toHaveTextContent('PRICE');
    expect(getByTestId('row-header-column-2')).toHaveTextContent('SIZE');
    expect(getByTestId('row-header-column-3')).toHaveTextContent('TOTAL');
  });

  it('should display the header in reverse order', () => {
    const { getByTestId } = render(
      <OrderBookRowHeader reverse />,
    );

    expect(getByTestId('row-header-column-1')).toHaveTextContent('TOTAL');
    expect(getByTestId('row-header-column-2')).toHaveTextContent('SIZE');
    expect(getByTestId('row-header-column-3')).toHaveTextContent('PRICE');
  });
});
