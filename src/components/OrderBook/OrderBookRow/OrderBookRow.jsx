import React from 'react';
import PropTypes from 'prop-types';
import styles from './OrderBookRow.module.scss';

OrderBookRow.propTypes = {
  dataTestid: PropTypes.string,
  isBid: PropTypes.bool,
  percent: PropTypes.number.isRequired,
  priceInCents: PropTypes.string.isRequired,
  progressOnRight: PropTypes.bool,
  reverse: PropTypes.bool,
  size: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

OrderBookRow.defaultProps = {
  dataTestid: undefined,
  isBid: false,
  progressOnRight: false,
  reverse: false,
};

/**
 * Displays an order as a row with a progress bar noting the percentage of the total.
 *
 * @param {boolean=} dataTestid - data-testid for testing
 * @param {boolean=} isBid - if the order type is a bid
 * @param {number} percent - percent of order size relative to total orders
 * @param {number} priceInCents - price in cents
 * @param {boolean=} progressOnRight - true if progress bar should display from right to left
 * @param {boolean=} reverse - true if the order row should be reversed
 * @param {number} size - size of order
 * @param {number} total - cumulative size of this order and all lower orders
 * @returns {JSX.Element}
 */
export default function OrderBookRow({
  dataTestid,
  isBid,
  percent,
  priceInCents,
  progressOnRight,
  reverse,
  size,
  total,
}) {
  const orderRowColor = isBid ? 'green' : 'red';
  const priceToDisplay = parseFloat((priceInCents / 100).toFixed(2)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={styles.orderBookRow}>
      <div
        data-testid="order-book-row-progress-bar-wrapper"
        className={styles.percentageBar}
        style={{ justifyContent: `${progressOnRight ? 'flex-end' : 'flex-start'}` }}
      >
        <div
          data-testid="order-book-row-progress-bar"
          style={{ width: `${percent}%` }}
          className={`${styles.progress}
           ${styles[orderRowColor]}`}
        />
      </div>

      <div data-testid={`${dataTestid}-column-1`} className={`${styles.rowItem} ${reverse ? '' : styles[orderRowColor]}`}>
        {reverse ? total.toLocaleString() : priceToDisplay}
      </div>
      <div data-testid={`${dataTestid}-column-2`} className={styles.rowItem}>
        {size.toLocaleString()}
      </div>
      <div data-testid={`${dataTestid}-column-3`} className={`${styles.rowItem} ${reverse ? styles[orderRowColor] : ''}`}>
        {reverse ? priceToDisplay : total.toLocaleString()}
      </div>
    </div>
  );
}
