import React from 'react';
import { render } from '@testing-library/react';
import OrderBookRow from './OrderBookRow';

describe('OrderBookRow', () => {
  const dataTestid = 'order-book-row';
  const mockOrder = {
    priceInCents: '1000',
    percent: 20,
    size: 50,
    total: 3050,
  };

  /**
   * Setup test with params.
   * @param {boolean=} isBid - whether the order is a bid
   * @param {boolean=} reverse - to display columns in reverse order
   * @param {boolean=} progressOnRight - to display the progress bar on the right
   * @returns {RenderResult}
   */
  function setupTest({ isBid, reverse, progressOnRight } = {}) {
    return render(
      <OrderBookRow
        priceInCents={mockOrder.priceInCents}
        dataTestid={dataTestid}
        size={mockOrder.size}
        total={mockOrder.total}
        percent={mockOrder.percent}
        isBid={isBid}
        reverse={reverse}
        progressOnRight={progressOnRight}
      />,
    );
  }

  it('should display columns in order with correct percent', () => {
    const { getByTestId } = setupTest();

    expect(getByTestId('order-book-row-progress-bar')).toHaveStyle('width: 20%');
    expect(getByTestId(`${dataTestid}-column-1`)).toHaveTextContent('10.00');
    expect(getByTestId(`${dataTestid}-column-2`)).toHaveTextContent(mockOrder.size.toLocaleString());
    expect(getByTestId(`${dataTestid}-column-3`)).toHaveTextContent(mockOrder.total.toLocaleString());
  });

  it('should display columns in reverse order', () => {
    const { getByTestId } = setupTest({ reverse: true });

    expect(getByTestId(`${dataTestid}-column-1`)).toHaveTextContent(mockOrder.total.toLocaleString());
    expect(getByTestId(`${dataTestid}-column-2`)).toHaveTextContent(mockOrder.size.toLocaleString());
    expect(getByTestId(`${dataTestid}-column-3`)).toHaveTextContent('10.00');
  });

  it('should display red colors for asks', () => {
    const { getByTestId } = setupTest();

    expect(getByTestId(`${dataTestid}-column-1`)).toHaveClass('red');
    expect(getByTestId('order-book-row-progress-bar')).toHaveClass('red');
    expect(getByTestId('order-book-row-progress-bar-wrapper')).toHaveStyle('justify-content: flex-start');
  });

  it('should display green colors for bids', () => {
    const { getByTestId } = setupTest({ isBid: true });

    expect(getByTestId(`${dataTestid}-column-1`)).toHaveClass('green');
    expect(getByTestId('order-book-row-progress-bar')).toHaveClass('green');
  });

  it('should display the progress bar on the left', () => {
    const { getByTestId } = setupTest();

    expect(getByTestId('order-book-row-progress-bar-wrapper')).toHaveStyle('justify-content: flex-start');
  });

  it('should display the progress bar on the right', () => {
    const { getByTestId } = setupTest({ progressOnRight: true });

    expect(getByTestId('order-book-row-progress-bar-wrapper')).toHaveStyle('justify-content: flex-end;');
  });
});
