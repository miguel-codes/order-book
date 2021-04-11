import React from 'react';
import PropTypes from 'prop-types';
import OrderBookRow from '../OrderBookRow';
import styles from '../OrderBook.module.scss';
import OrderBookRowHeader from '../OrderBookRowHeader/OrderBookRowHeader';

OrderBookPage.propTypes = {
  asksOrBids: PropTypes.shape({
    size: PropTypes.number,
    total: PropTypes.number,
  }),
  dataTestid: PropTypes.string,
  hideHeader: PropTypes.bool,
  isBid: PropTypes.bool,
  progressOnRight: PropTypes.bool,
  reverse: PropTypes.bool,
  sortedKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  totalAsksOrBids: PropTypes.number.isRequired,
};

OrderBookPage.defaultProps = {
  asksOrBids: { size: undefined, total: undefined },
  dataTestid: undefined,
  hideHeader: false,
  isBid: false,
  progressOnRight: false,
  reverse: false,
};

/**
 * Display a set of rows of bids or asks for an order
 * @param {object} asksOrBids - order asks or bids
 * @param {string=} dataTestid - data-testid for testing
 * @param {boolean=} hideHeader - whether to hide the header
 * @param {boolean=} isBid - true if the order type is a bid
 * @param {boolean=} progressOnRight - whether to display the progress bar on the right
 * @param {boolean=} reverse - whether to reverse the rows
 * @param {string[]} sortedKeys - array of sorted keys
 * @param {number} totalAsksOrBids - cumulative size of all asks or bids for order
 * @returns {JSX.Element}
 * @constructor
 */
export default function OrderBookPage({
  asksOrBids,
  dataTestid,
  hideHeader,
  isBid,
  progressOnRight,
  reverse,
  sortedKeys,
  totalAsksOrBids,
}) {
  return (
    <div className={styles.orderSection}>
      {!hideHeader && <OrderBookRowHeader reverse={reverse} />}

      {sortedKeys.map((priceKey, index) => (
        <OrderBookRow
          dataTestid={`${dataTestid}-${index}`}
          key={priceKey}
          priceInCents={priceKey}
          size={asksOrBids[priceKey].size}
          total={asksOrBids[priceKey].total}
          percent={(asksOrBids[priceKey].total / totalAsksOrBids) * 100}
          isBid={isBid}
          progressOnRight={progressOnRight}
          reverse={reverse}
        />
      ))}
    </div>
  );
}
