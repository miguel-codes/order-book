import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import OrderBookSpread from './OrderBookSpread';

describe('OrderBookSpread', () => {
  let setPriceGroupMock;

  beforeEach(() => {
    setPriceGroupMock = jest.fn();
  });

  function setupTest(priceGroup = 1) {
    return render(
      <OrderBookSpread
        priceGroup={priceGroup}
        setPriceGroup={setPriceGroupMock}
        spread="10"
        percent="0.20"
      />,
    );
  }

  it('should display a priceGroup', () => {
    const { getByTestId } = setupTest();

    expect(getByTestId('order-book-spread-price-group')).toHaveTextContent('Group: 0.5');
  });

  it('should have disabled decrement button at lowest price group', () => {
    const { getByTestId } = setupTest(1);

    expect(getByTestId('decrement-price-group-button').closest('div')).toHaveClass('disabled');
  });

  it('should have disabled increment button at highest price group', () => {
    const { getByTestId } = setupTest(12);

    expect(getByTestId('increment-price-group-button').closest('div')).toHaveClass('disabled');
  });

  it('should decrement the priceGroup', () => {
    const { getByTestId } = setupTest(2);

    fireEvent.click(getByTestId('decrement-price-group-button'));

    expect(setPriceGroupMock).toHaveBeenCalledTimes(1);
    expect(setPriceGroupMock).toHaveBeenCalledWith(1);
  });

  it('should increment the priceGroup', () => {
    const { getByTestId } = setupTest(1);

    fireEvent.click(getByTestId('increment-price-group-button'));

    expect(setPriceGroupMock).toHaveBeenCalledTimes(1);
    expect(setPriceGroupMock).toHaveBeenCalledWith(2);
  });
});
