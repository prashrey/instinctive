"use client";

import { createContext, useContext, useReducer, useCallback, useMemo } from "react";

const StoreContext = createContext();

async function fetchFromAPI(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

const initialState = {
  products: [],
  filters: {},
  selectedFilters: {},
  sortBy: "relevant",
  loading: false,
  error: null,
};

export const ACTIONS = {
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_FILTERS: "SET_FILTERS",
  SET_SELECTED_FILTERS: "SET_SELECTED_FILTERS",
  SET_SORT: "SET_SORT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

const storeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload.products || [],
        loading: false,
      };
    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          categories: action.payload.categories || [],
          brands: action.payload.brands || [],
          priceRanges: action.payload.priceRanges || [],
          locations: action.payload.locations || [],
          clusters: action.payload.clusters || [],
        },
      };

    case ACTIONS.SET_SELECTED_FILTERS:
      return {
        ...state,
        selectedFilters: action.payload,
      };

    case ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload,
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const safeDispatch = useCallback(
    async (apiCall, actionType, errorMessage) => {
      if (state.loading) return;

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      try {
        const data = await apiCall();
        if (!data) throw new Error("No data received from API");
        dispatch({ type: actionType, payload: data });
      } catch (error) {
        console.error(`Error in ${actionType}:`, error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage || error.message });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },
    [state.loading]
  );

  const actions = useMemo(
    () => ({
      searchProducts: (query, filters = {}, sort = null) => {
        const params = { ...state.selectedFilters };

        if (query !== undefined && query !== null && query !== "") {
          params.search = query;
        }

        const newSort = sort !== null ? sort : state.sortBy;
        if (newSort !== state.sortBy) {
          dispatch({ type: ACTIONS.SET_SORT, payload: newSort });
        }

        if (newSort !== "relevant") {
          params.sort = newSort;
        }

        Object.assign(params, filters);

        return safeDispatch(
          () => fetchFromAPI("/api/products", params),
          ACTIONS.SET_PRODUCTS,
          "Failed to fetch products"
        );
      },

      loadFilters: () => {
        return safeDispatch(() => fetchFromAPI("/api/products/filters"), ACTIONS.SET_FILTERS, "Failed to load filters");
      },

      updateFilters: filters => {
        const params = { ...filters };
        const currentSort = state.sortBy;

        if (currentSort !== "relevant") {
          params.sort = currentSort;
        }

        dispatch({ type: ACTIONS.SET_SELECTED_FILTERS, payload: filters });

        return safeDispatch(
          () => fetchFromAPI("/api/products", params),
          ACTIONS.SET_PRODUCTS,
          "Failed to fetch products"
        );
      },

      updateSort: sortBy => {
        dispatch({ type: ACTIONS.SET_SORT, payload: sortBy });

        const params = { ...state.selectedFilters };
        if (sortBy !== "relevant") {
          params.sort = sortBy;
        }

        return safeDispatch(
          () => fetchFromAPI("/api/products", params),
          ACTIONS.SET_PRODUCTS,
          "Failed to fetch products"
        );
      },

      clearError: () => dispatch({ type: ACTIONS.SET_ERROR, payload: null }),
    }),
    [safeDispatch, state.selectedFilters, state.sortBy]
  );

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
