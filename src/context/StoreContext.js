"use client";

import { createContext, useContext, useReducer, useCallback, useMemo } from "react";

const StoreContext = createContext();

function fetchFromAPI(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("API Response:", data);
        resolve(data);
      })
      .catch(error => {
        console.error("API Error:", error);
        reject(error);
      });
  });
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

  const safeDispatch = useCallback(async (apiCall, actionType, errorMessage) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await apiCall();
      dispatch({ type: actionType, payload: data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage || error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);
  const actions = useMemo(() => {
    return {
      searchProducts: (query, filters = {}, sort = "relevant") => {
        const params = { ...state.selectedFilters };

        if (query !== undefined && query !== null && query !== "") {
          params.search = query;
        }

        if (sort !== state.sortBy) {
          dispatch({ type: ACTIONS.SET_SORT, payload: sort });
        }

        if (state.sortBy !== "relevant") {
          params.sort = state.sortBy;
        }

        Object.assign(params, filters);

        safeDispatch(() => fetchFromAPI("/api/products", params), ACTIONS.SET_PRODUCTS, "Failed to fetch products");
      },

      loadFilters: () => {
        safeDispatch(() => fetchFromAPI("/api/products/filters"), ACTIONS.SET_FILTERS, "Failed to load filters");
      },
      updateFilters: filters => {
        const params = { ...filters };
        if (state.sortBy !== "relevant") {
          params.sort = state.sortBy;
        }

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_SELECTED_FILTERS, payload: filters });

        return fetchFromAPI("/api/products", params)
          .then(data => {
            dispatch({ type: ACTIONS.SET_PRODUCTS, payload: data });
          })
          .catch(error => {
            dispatch({ type: ACTIONS.SET_ERROR, payload: "Failed to fetch products" });
          })
          .finally(() => {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
          });
      },
      updateSort: sortBy => {
        dispatch({ type: ACTIONS.SET_SORT, payload: sortBy });

        const params = { ...state.selectedFilters };
        if (sortBy !== "relevant") {
          params.sort = sortBy;
        }

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        return safeDispatch(
          () => fetchFromAPI("/api/products", params),
          ACTIONS.SET_PRODUCTS,
          "Failed to fetch products"
        );
      },

      clearError: () => dispatch({ type: ACTIONS.SET_ERROR, payload: null }),
    };
  }, [safeDispatch, state.selectedFilters, state.sortBy]);

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
