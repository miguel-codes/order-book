import React from 'react';
import PropTypes from 'prop-types';
import styles from '../OrderBook.module.scss';

OrderBookRowHeader.propTypes = {
  reverse: PropTypes.bool,
};

OrderBookRowHeader.defaultProps = {
  reverse: false,
};

/**
 * Header for order book rows.
 * @param {boolean=} reverse - whether to show the columns in reverse order
 * @returns {JSX.Element}
 */
export default function OrderBookRowHeader({ reverse }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowItem}>
        <div data-testid="row-header-column-1" className={styles.underlinedText}>
          {reverse ? 'TOTAL' : 'PRICE'}
        </div>
      </div>
      <div className={styles.rowItem}>
        <div data-testid="row-header-column-2" className={styles.underlinedText}>SIZE</div>
      </div>
      <div className={styles.rowItem}>
        <div data-testid="row-header-column-3" className={styles.underlinedText}>
          {reverse ? 'PRICE' : 'TOTAL'}
        </div>
      </div>
    </div>
  );
}
