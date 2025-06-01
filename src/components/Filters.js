'use client';

import { useStore } from '@/context/StoreContext';
import styles from './Filters.module.css';

const FilterSection = ({ title, options, selected = [], onChange }) => (
  <div className={styles.filterSection}>
    <h3>{title}</h3>
    <div className={styles.options}>
      {options.map(option => (
        <label key={option} className={styles.filterOption}>
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, option]);
              } else {
                onChange(selected.filter(item => item !== option));
              }
            }}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const Filters = () => {
  const { state, actions } = useStore();
  const { filters, selectedFilters } = state;

  const handleFilterChange = (filterType, values) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: values.length > 0 ? values : undefined
    };

    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]?.length) {
        delete newFilters[key];
      }
    });

    actions.updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    actions.updateFilters({});
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterHeader}>
        <h2>Filters</h2>
        {Object.keys(selectedFilters).length > 0 && (
          <button 
            onClick={handleClearFilters}
            className={styles.clearButton}
          >
            Clear All
          </button>
        )}
      </div>

      {filters.categories?.length > 0 && (
        <FilterSection
          title="Categories"
          options={filters.categories}
          selected={selectedFilters.category || []}
          onChange={(values) => handleFilterChange('category', values)}
        />
      )}

      {filters.brands?.length > 0 && (
        <FilterSection
          title="Brands"
          options={filters.brands}
          selected={selectedFilters.brand || []}
          onChange={(values) => handleFilterChange('brand', values)}
        />
      )}

      {filters.priceRanges?.length > 0 && (
        <FilterSection
          title="Price Ranges"
          options={filters.priceRanges}
          selected={selectedFilters.priceRange || []}
          onChange={(values) => handleFilterChange('priceRange', values)}
        />
      )}

      {filters.locations?.length > 0 && (
        <FilterSection
          title="Locations"
          options={filters.locations}
          selected={selectedFilters.location || []}
          onChange={(values) => handleFilterChange('location', values)}
        />
      )}

      {filters.clusters?.length > 0 && (
        <FilterSection
          title="Types"
          options={filters.clusters}
          selected={selectedFilters.cluster || []}
          onChange={(values) => handleFilterChange('cluster', values)}
        />
      )}
    </div>
  );
};

export default Filters;