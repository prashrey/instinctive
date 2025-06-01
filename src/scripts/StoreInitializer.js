"use client";

import { useEffect, useCallback } from "react";
import { useStore } from "@/context/StoreContext";

export default function StoreInitializer() {
  const { actions } = useStore();

  const initializeStore = useCallback(() => {
    actions.searchProducts();
    actions.loadFilters();
  }, [actions]);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return null;
}
