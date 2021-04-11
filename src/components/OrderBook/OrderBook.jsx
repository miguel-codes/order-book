import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './OrderBook.module.scss';
import OrderBookSpread from './OrderBookSpread/OrderBookSpread';
import OrderBookPage from './OrderBookPage/OrderBookPage';
import {ORDERBOOK_PRICE_GROUP} from '../../lib/constants';

/**
 * Displays an order book in vertical format for mobile and horizontal format for desktop.
 *
 * Note that prices are converted to cents in order to use the price in cents as a key
 * for ask and bid orders in a format of orders.bids[priceInCents].
 *
 * @returns {JSX.Element}
 */
export default function OrderBook() {
  const [orders, setOrders] = useState({ bids: {}, asks: {} });
  const [isPaused, setIsPaused] = useState(false);
  const [priceGroup, setPriceGroup] = useState(1);
  const socket = useRef(null);
  const MAX_ROWS = 10;
  const RECONNECT_TIMEOUT = 5000;

  /**
   * Connects to the websocket and handles errors.
   */
  function connectWebsocket() {
    if (socket.current) {
      socket.current = null;
    }
    const XbtFuturesMessage = JSON.stringify({ event: 'subscribe', feed: 'book_ui_1', product_ids: ['PI_XBTUSD'] });
    socket.current = new WebSocket('wss://www.cryptofacilities.com/ws/v1');

    socket.current.onopen = () => {
      socket.current.send(XbtFuturesMessage);
    };

    socket.current.onclose = () => {
      // console.log(`Socket closed. Reconnecting in ${RECONNECT_TIMEOUT / 1000} seconds`);
      setTimeout(() => connectWebsocket(), RECONNECT_TIMEOUT);
    };

    socket.current.onerror = (err) => {
      console.error('Socket error - ', err.message);
      socket.current.close();
    };
  }

  /**
   * Connects to the websocket when the component loads,
   * and disconnects when the component unmounts.
   */
  useEffect(() => {
    connectWebsocket();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  /**
   * Sanitizes websocket data and pauses the websocket if isPaused is true.
   * Used for debugging.
   */
  useEffect(() => {
    if (!socket.current) {
      return;
    }

    socket.current.onmessage = (e) => {
      if (isPaused) {
        return;
      }
      try {
        const cleanData = DOMPurify.sanitize(e.data);
        const data = JSON.parse(cleanData);
        const ordersToUpdate = {};

        if (Array.isArray(data.asks)) {
          ordersToUpdate.asks = data.asks;
        }

        if (Array.isArray(data.bids)) {
          ordersToUpdate.bids = data.bids;
        }

        updateOrders(ordersToUpdate);
      } catch (err) {
        console.error('Parsing error: ', err.message);
      }
    };
  }, [isPaused, socket.current]);

  /**
   * Updates the orders object with new data returned from the websocket.
   * Any new orders with size 0 will remove the order's price key from orders.asks/bids.
   * @param {object} newOrders
   */
  function updateOrders(newOrders) {
    if (!newOrders) {
      return;
    }

    setOrders((prevOrders) => {
      const ordersToUpdate = { ...prevOrders };

      if (newOrders.asks) {
        ordersToUpdate.asks = updateOrdersObjectByType(ordersToUpdate.asks, newOrders.asks);
      }

      if (newOrders.bids) {
        ordersToUpdate.bids = updateOrdersObjectByType(ordersToUpdate.bids, newOrders.bids);
      }

      ordersToUpdate.bids = addTotalField(ordersToUpdate.bids, true);
      ordersToUpdate.asks = addTotalField(ordersToUpdate.asks);

      return ordersToUpdate;
    });
  }

  /**
   * Updates the orders object with new ask or bid orders.
   * @param askOrBidOrdersToUpdate - object of orders to update
   * @param newAsksOrBids - new asks or bids to add to previous orders
   */
  function updateOrdersObjectByType(askOrBidOrdersToUpdate, newAsksOrBids) {
    const shouldRemovePrice = (orderAmount) => orderAmount === 0;
    const askOrBidOrdersToReturn = { ...askOrBidOrdersToUpdate };
    let priceKey;

    newAsksOrBids.forEach((askOrBid) => {
      priceKey = askOrBid[0] * 100;
      if (shouldRemovePrice(askOrBid[1])) {
        delete askOrBidOrdersToReturn[priceKey];
      } else {
        askOrBidOrdersToReturn[priceKey] = {
          size: askOrBid[1],
        };
      }
    });

    return askOrBidOrdersToReturn;
  }

  /**
   * Adds a running size total to ask or bid offers.
   * @param askOrBidOrdersToUpdate - object of orders to update
   * @param {boolean=} shouldReverse - true if the sorted keys ordering should be reversed
   */
  function addTotalField(askOrBidOrdersToUpdate, shouldReverse) {
    const sortedKeys = getSortedKeysArray(askOrBidOrdersToUpdate, shouldReverse);
    const askOrBidOrdersToReturn = { ...askOrBidOrdersToUpdate };
    let runningSizeTotal = 0;

    sortedKeys.forEach((priceKey) => {
      runningSizeTotal += askOrBidOrdersToUpdate[priceKey].size;
      askOrBidOrdersToReturn[priceKey].total = runningSizeTotal;
    });

    return askOrBidOrdersToReturn;
  }

  /**
   * Returns an array of sorted object keys.
   * @param {object} objectToSort - orders.bids or orders.asks
   * @param {boolean=} shouldReverse - if the keys should be returned in reverse sorted order
   * @param {number=} arraySizeLimit - size limit of returned array
   * @returns {string[]} sortedKeys - sorted keys
   */
  function getSortedKeysArray(objectToSort, shouldReverse, arraySizeLimit) {
    if (!objectToSort) {
      return;
    }
    const keysToReturn = Object.keys(objectToSort);
    keysToReturn.sort();

    if (shouldReverse) {
      keysToReturn.reverse();
    }

    return arraySizeLimit ? keysToReturn.slice(0, arraySizeLimit) : keysToReturn;
  }

  /**
   * Groups orders by rounding prices to priceGroup setting
   * @param {object} asksOrBids - ask or bid orders
   * @param {string[]} sortedKeys - sorted ask or bid keys
   * @returns {object}
   */
  function getGroupedAsksOrBids(asksOrBids, sortedKeys) {
    const groupedAsksOrBids = {};
    let groupedPrice;

    sortedKeys.forEach((priceKey) => {
      groupedPrice = roundPriceByGroup(priceKey);

      if (groupedAsksOrBids[groupedPrice]) {
        groupedAsksOrBids[groupedPrice].size += asksOrBids[priceKey].size;
        groupedAsksOrBids[groupedPrice].total += asksOrBids[priceKey].size;
      } else {
        groupedAsksOrBids[groupedPrice] = {
          size: asksOrBids[priceKey].size,
          total: asksOrBids[priceKey].total,
        };
      }
    });

    return groupedAsksOrBids;
  }

  /**
   * Rounds the price to match the selected priceGroup.
   * @param {number} priceInCents - ask or bid price in cents
   * @returns {number}
   */
  function roundPriceByGroup(priceInCents) {
    const divisor = ORDERBOOK_PRICE_GROUP[priceGroup] * 100;
    return Math.ceil(priceInCents / divisor) * divisor;
  }

  /**
   * Given more time I would extract these into helpers in order to minimize the size of this file.
   */
  const sortedAskKeys = getSortedKeysArray(orders.asks, false);
  const sortedBidKeys = getSortedKeysArray(orders.bids, true);

  const groupedAsks = getGroupedAsksOrBids(orders.asks, sortedAskKeys);
  const groupedBids = getGroupedAsksOrBids(orders.bids, sortedBidKeys);

  const sortedGroupedAskKeys = getSortedKeysArray(groupedAsks, false, MAX_ROWS);
  const sortedGroupedBidKeys = getSortedKeysArray(groupedBids, true, MAX_ROWS);

  const totalAsks = sortedGroupedAskKeys.reduce((a, priceKey) => a + groupedAsks[priceKey].size, 0);
  const totalBids = sortedGroupedBidKeys.reduce((a, priceKey) => a + groupedBids[priceKey].size, 0);

  const spread = ((sortedGroupedAskKeys[0] - sortedGroupedBidKeys[0]) / 100).toFixed(2);
  const spreadPercent = ((spread / sortedGroupedBidKeys[0]) * 100 * 100).toFixed(2);

  return (
    <div data-testid="order-book" className={styles.orderBook}>
      <div className={styles.buttonSection}>
        <span className={styles.icon}>
          <FontAwesomeIcon
            data-testid="toggle-pause-button"
            icon={isPaused ? faPlayCircle : faPauseCircle}
            onClick={() => setIsPaused(!isPaused)}
          />
        </span>
      </div>

      <div className={styles.cardHeader}>Orderbook</div>

      {/**
       * Mobile view
       */}
      <div className={styles.mobileView}>
        <div className={styles.orderSectionWrapper}>

          <OrderBookPage
            dataTestid="desktop-order-book-asks"
            asksOrBids={groupedAsks}
            sortedKeys={[...sortedGroupedAskKeys].reverse()}
            totalAsksOrBids={totalAsks}
          />

          <div className={styles.spreadSection}>
            <OrderBookSpread
              priceGroup={priceGroup}
              setPriceGroup={setPriceGroup}
              spread={spread}
              percent={spreadPercent}
            />
          </div>

          <OrderBookPage
            dataTestid="desktop-order-book-bids"
            asksOrBids={groupedBids}
            sortedKeys={sortedGroupedBidKeys}
            totalAsksOrBids={totalBids}
            isBid
            hideHeader
          />
        </div>
      </div>

      {/**
       * Desktop view
       */}
      <div className={styles.desktopView}>
        <div className={styles.spreadSection}>
          <OrderBookSpread
            priceGroup={priceGroup}
            setPriceGroup={setPriceGroup}
            spread={spread}
            percent={spreadPercent}
          />
        </div>
        <div className={styles.orderSectionWrapper}>

          <OrderBookPage
            asksOrBids={groupedBids}
            sortedKeys={sortedGroupedBidKeys}
            totalAsksOrBids={totalBids}
            reverse
            isBid
            progressOnRight
          />

          <OrderBookPage
            asksOrBids={groupedAsks}
            sortedKeys={sortedGroupedAskKeys}
            totalAsksOrBids={totalAsks}
          />
        </div>
      </div>
    </div>
  );
}
