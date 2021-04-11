import React from 'react';
import { render } from '@testing-library/react';
import OrderBookPage from './OrderBookPage';

describe('OrderBookPage', () => {
  const asks = {
    100: {
      size: 400,
      total: 1000,
    },
  };
  const sortedKeys = ['100'];

  function setupTest(hideHeader) {
    return render(
      <OrderBookPage
        asksOrBids={asks}
        sortedKeys={sortedKeys}
        totalAsksOrBids={1000}
        hideHeader={hideHeader}
      />,
    );
  }

  it('should display the OrderRowHeader', () => {
    const { getByTestId } = setupTest();

    expect(getByTestId('row-header-column-1')).toBeInTheDocument();
  });

  it('should hide the OrderRowHeader', () => {
    const { queryByTestId } = setupTest(true);

    expect(queryByTestId('row-header-column-1')).toBeNull();
  });
});
