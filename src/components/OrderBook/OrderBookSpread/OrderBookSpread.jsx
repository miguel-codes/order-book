import React from 'react';
import PropTypes from 'prop-types';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ORDERBOOK_PRICE_GROUP } from '../../../lib/constants';
import styles from '../OrderBook.module.scss';

OrderBookSpread.propTypes = {
  percent: PropTypes.string.isRequired,
  priceGroup: PropTypes.number.isRequired,
  setPriceGroup: PropTypes.func.isRequired,
  spread: PropTypes.string.isRequired,
};

/**
 * Displays the spread and price grouping for the orderBook.
 * @param {string} percent - spread percent
 * @param {number} priceGroup - price group for grouping
 * @param {function} setPriceGroup - function to update price group
 * @param {string} spread - spread between the bid and ask price
 * @returns {JSX.Element}
 */
export default function OrderBookSpread({ percent, priceGroup, setPriceGroup, spread }) {
  const priceGroupToDisplay = parseFloat((ORDERBOOK_PRICE_GROUP[priceGroup])
    .toFixed(2)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /**
   * Updates the price grouping if possible.
   * @param {boolean=} isIncrement - if the group is being incremented
   */
  function handleGroupUpdate(isIncrement) {
    if (isIncrement) {
      setPriceGroup(priceGroup + 1);
    } else {
      setPriceGroup(priceGroup - 1);
    }
  }

  /**
   * Returns true if the group key can be decremented.
   *
   * @returns {boolean}
   */
  function canDecrement() {
    return !!ORDERBOOK_PRICE_GROUP[priceGroup - 1];
  }

  /**
   * Returns true if the
   * @returns {boolean}
   */
  function canIncrement() {
    return !!ORDERBOOK_PRICE_GROUP[priceGroup + 1];
  }

  return (
    <div className={styles.spreadSection}>
      <div className={styles.spreadItem}>
        {spread}
      </div>
      <div className={`${styles.spreadItem} ${styles.underlinedText}`}>
        Spread
      </div>
      <div className={styles.spreadItem}>
        {`${percent}%`}
      </div>
      <div className={styles.spreadItem}>
        <div
          data-testid="order-book-spread-price-group"
          className={`${styles.priceGroup} ${styles.underlinedText}`}
        >
          {`Group: ${priceGroupToDisplay}`}
        </div>
        <div className={`${styles.icon} ${canDecrement() ? '' : styles.disabled}`}>
          <FontAwesomeIcon
            data-testid="decrement-price-group-button"
            icon={faMinus}
            onClick={() => handleGroupUpdate(false)}
          />
        </div>
        <div className={`${styles.icon} ${canIncrement() ? '' : styles.disabled}`}>
          <FontAwesomeIcon
            data-testid="increment-price-group-button"
            icon={faPlus}
            onClick={() => handleGroupUpdate(true)}
          />
        </div>
      </div>
    </div>
  );
}
