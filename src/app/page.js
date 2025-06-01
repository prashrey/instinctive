"use client";

import Filters from "@/components/Filters/Filters";
import SortingOptions from "@/components/Filters/SortingOptions";
import ProductList from "@/components/Product/ProductList";
import StoreInitializer from "@/scripts/StoreInitializer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <StoreInitializer />
      <main className={styles.page}>
        <div className={styles.main}>
          <section className={styles.content}>
            <aside className={styles.sidebar}>
              <SortingOptions />
              <Filters />
            </aside>
            <section className={styles.products}>
              <ProductList />
            </section>
          </section>
        </div>
      </main>
    </>
  );
}
