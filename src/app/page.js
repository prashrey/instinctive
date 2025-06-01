"use client";

import Filters from "@/components/Filters";
import SortingOptions from "@/components/SortingOptions";
import ProductList from "@/components/ProductList";
import StoreInitializer from "@/components/StoreInitializer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <StoreInitializer />
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.searchControls}>
            <SortingOptions />
          </div>
          <div className={styles.content}>
            <aside className={styles.sidebar}>
              <Filters />
            </aside>
            <section className={styles.products}>
              <ProductList />
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
