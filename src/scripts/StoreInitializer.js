"use client";

import { useEffect, useCallback, useRef } from "react";
import { useStore } from "@/context/StoreContext";

export default function StoreInitializer() {
  const { actions } = useStore();
  const initialized = useRef(false);

  const initializeStore = useCallback(async () => {
    if (initialized.current) return;

    try {
      await actions.loadFilters();
      await actions.searchProducts();
      initialized.current = true;
    } catch (error) {
      console.error("Failed to initialize store:", error);
    }
  }, [actions]);

  useEffect(() => {
    initializeStore();

    return () => {
      initialized.current = false;
    };
  }, [initializeStore]);

  return null;
}
