'use client';

import { useStore } from '@/context/StoreContext';
import styles from './SortingOptions.module.css';

const SortingOptions = () => {
  const { state, actions } = useStore();

  const handleSortChange = (e) => {
    actions.updateSort(e.target.value);
  };

  return (
    <div className={styles.sortingContainer}>
      <label htmlFor="sorting" className={styles.sortLabel}>Sort by:</label>
      <select
        id="sorting"
        className={styles.sortSelect}
        value={state.sortBy}
        onChange={handleSortChange}
        disabled={state.loading}
      >
        <option value="relevant">Most Relevant</option>
        <option value="price_high_low">Price: High to Low</option>
        <option value="price_low_high">Price: Low to High</option>
      </select>
    </div>
  );
};

export default SortingOptions;
