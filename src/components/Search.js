"use client";

import { useState } from "react";
import styles from "./Search.module.css";
import { useStore } from "@/context/StoreContext";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { state, actions } = useStore();

  const handleSearch = e => {
    e.preventDefault();
    actions.searchProducts(searchQuery.trim());
  };

  const handleInputChange = e => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      actions.searchProducts("");
    }
  };
  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton} disabled={state.loading}>
          {state.loading ? "Searching..." : "Search"}
        </button>
      </form>
      {state.error && <div className={styles.errorMessage}>{state.error}</div>}
    </div>
  );
};

export default Search;
