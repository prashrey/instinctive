"use client";

import { useStore } from "@/context/StoreContext";
import Image from "next/image";
import styles from "./ProductList.module.css";

const ProductList = () => {
  const { state } = useStore();
  const products = state.products;

  if (state.loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (state.error) {
    return <div className={styles.error}>{state.error}</div>;
  }

  if (!products?.length) {
    return <div className={styles.noResults}>No products found</div>;
  }

  return (
    <div className={styles.grid}>
      {products.map(product => (
        <div key={product.id} className={styles.product}>
          <div className={styles.imageContainer}>
            <Image
              src={product.imgUrl ? product.imgUrl : "/product-placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles.productImage}
              onError={e => {
                e.target.src = "/product-placeholder.svg";
              }}
            />
          </div>
          <div className={styles.productInfo}>
            <h3>{product.name}</h3>
            <p className={styles.price}>Price Range: ${product.facets.priceRange}</p>
            <p className={styles.brand}>{product.facets.brand}</p>
            <p className={styles.category}>{product.facets.category}</p>
            <p className={styles.location}>{product.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
