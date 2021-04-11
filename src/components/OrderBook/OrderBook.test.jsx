import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import OrderBook from './OrderBook';

describe('OrderBook', () => {
  const mockBidsAndAsks = {
    asks: [[10, 100], [20, 200]],
    bids: [[15, 150], [25, 250]],
  };
  let server;

  beforeEach(() => {
    server = new WS('wss://www.cryptofacilities.com/ws/v1');
  });

  afterEach(() => {
    WS.clean();
  });

  it('should send a message to the websocket', async () => {
    render(<OrderBook />);

    await waitFor(() => {
      expect(server).toReceiveMessage({ event: 'subscribe', feed: 'book_ui_1', product_ids: ['PI_XBTUSD'] });
    });
  });

  it('should load bids and asks with correct values in OrderBookPage', () => {
    const { getByTestId } = render(<OrderBook />);

    server.send(JSON.stringify(mockBidsAndAsks));

    const ask0 = { price: mockBidsAndAsks.asks[0][0].toString(), size: mockBidsAndAsks.asks[0][1] };
    const ask1 = { price: mockBidsAndAsks.asks[1][0].toString(), size: mockBidsAndAsks.asks[1][1] };
    const bid0 = { price: mockBidsAndAsks.bids[0][0].toString(), size: mockBidsAndAsks.bids[0][1] };
    const bid1 = { price: mockBidsAndAsks.bids[1][0].toString(), size: mockBidsAndAsks.bids[1][1] };

    expect(getByTestId('desktop-order-book-asks-0-column-1')).toHaveTextContent(ask1.price);
    expect(getByTestId('desktop-order-book-asks-0-column-2')).toHaveTextContent(ask1.size.toString());
    expect(getByTestId('desktop-order-book-asks-0-column-3')).toHaveTextContent((ask1.size + ask0.size).toString());

    expect(getByTestId('desktop-order-book-asks-1-column-1')).toHaveTextContent(ask0.price);
    expect(getByTestId('desktop-order-book-asks-1-column-2')).toHaveTextContent(ask0.size.toString());
    expect(getByTestId('desktop-order-book-asks-1-column-3')).toHaveTextContent(ask0.size.toString());

    expect(getByTestId('desktop-order-book-bids-0-column-1')).toHaveTextContent(bid1.price);
    expect(getByTestId('desktop-order-book-bids-0-column-2')).toHaveTextContent(bid1.size.toString());
    expect(getByTestId('desktop-order-book-bids-0-column-3')).toHaveTextContent(bid1.size.toString());

    expect(getByTestId('desktop-order-book-bids-1-column-1')).toHaveTextContent(bid0.price);
    expect(getByTestId('desktop-order-book-bids-1-column-2')).toHaveTextContent(bid0.size.toString());
    expect(getByTestId('desktop-order-book-bids-1-column-3')).toHaveTextContent((bid0.size + bid1.size).toString());
  });

  it('should remove bids and asks if passed size 0', () => {
    const { queryByTestId } = render(<OrderBook />);

    const bidsAndAsksToRemove = {
      asks: [[10, 0], [20, 0]],
      bids: [[15, 0], [25, 0]],
    };

    bidsAndAsksToRemove.asks[0][1] = 0;
    bidsAndAsksToRemove.asks[1][1] = 0;
    bidsAndAsksToRemove.bids[0][1] = 0;
    bidsAndAsksToRemove.bids[1][1] = 0;

    server.send(JSON.stringify(mockBidsAndAsks));
    server.send(JSON.stringify(bidsAndAsksToRemove));

    expect(queryByTestId('desktop-order-book-asks-0-column-1')).toBeNull();
    expect(queryByTestId('desktop-order-book-asks-1-column-1')).toBeNull();

    expect(queryByTestId('desktop-order-book-bids-0-column-1')).toBeNull();
    expect(queryByTestId('desktop-order-book-bids-1-column-1')).toBeNull();
  });

  it('should sanitize input and not process', () => {
    const { getByTestId, queryByTestId } = render(<OrderBook />);

    server.send(JSON.stringify(mockBidsAndAsks));
    server.send(JSON.stringify({ bids: <script>sneaky sneaky</script> }));

    expect(getByTestId('desktop-order-book-asks-0-column-1')).toBeInTheDocument();
    expect(getByTestId('desktop-order-book-asks-1-column-1')).toBeInTheDocument();
    expect(queryByTestId('desktop-order-book-asks-2-column-1')).toBeNull();

    expect(getByTestId('desktop-order-book-bids-0-column-1')).toBeInTheDocument();
    expect(getByTestId('desktop-order-book-bids-1-column-1')).toBeInTheDocument();
    expect(queryByTestId('desktop-order-book-bids-2-column-1')).toBeNull();
  });

  it('should pause and unpause the websocket processing', () => {
    const { getByTestId, queryByTestId } = render(<OrderBook />);

    const dataToUpdate = {
      asks: [[400, 1000]],
      bids: [[800, 2000]],
    };

    server.send(JSON.stringify(mockBidsAndAsks));
    fireEvent.click(getByTestId('toggle-pause-button'));
    server.send(JSON.stringify(dataToUpdate));

    expect(queryByTestId('desktop-order-book-asks-2-column-1')).toBeNull();
    expect(queryByTestId('desktop-order-book-bids-2-column-1')).toBeNull();

    fireEvent.click(getByTestId('toggle-pause-button'));
    server.send(JSON.stringify(dataToUpdate));

    expect(getByTestId('desktop-order-book-asks-2-column-1')).toBeInTheDocument();
    expect(getByTestId('desktop-order-book-bids-2-column-1')).toBeInTheDocument();
  });
});
