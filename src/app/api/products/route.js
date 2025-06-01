import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getProductsData = () => {
  const filePath = path.join(process.cwd(), "items.json");
  const fileData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileData);
};

const applyFilters = (products, filters) => {
  return products.filter(product => {
    return Object.entries(filters).every(([key, values]) => {
      if (!values || values.length === 0) return true;

      const productValue =
        key === "category" || key === "brand" || key === "priceRange" ? product.facets[key] : product[key];

      return values.includes(productValue);
    });
  });
};

const applySearch = (products, searchTerm) => {
  if (!searchTerm) return products;

  const search = searchTerm.toLowerCase();
  const matches = products.filter(
    p =>
      p.name.toLowerCase().includes(search) ||
      p.facets.brand.toLowerCase().includes(search) ||
      p.facets.category.toLowerCase().includes(search) ||
      p.cluster.toLowerCase().includes(search)
  );

  if (matches.length === 0) {
    const searchWords = search.split(" ");
    return products.filter(p => {
      return searchWords.some(
        word =>
          p.name.toLowerCase().includes(word) ||
          p.facets.brand.toLowerCase().includes(word) ||
          p.facets.category.toLowerCase().includes(word) ||
          p.cluster.toLowerCase().includes(word)
      );
    });
  }

  return matches;
};

const applySorting = (products, sort, searchTerm) => {
  switch (sort) {
    case "price_high_low":
      return products.sort((a, b) => {
        const [aMin] = a.facets.priceRange.split("-").map(Number);
        const [bMin] = b.facets.priceRange.split("-").map(Number);
        return bMin - aMin;
      });

    case "price_low_high":
      return products.sort((a, b) => {
        const [aMin] = a.facets.priceRange.split("-").map(Number);
        const [bMin] = b.facets.priceRange.split("-").map(Number);
        return aMin - bMin;
      });

    case "relevance":
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return products.sort((a, b) => {
          const aScore =
            (a.name.toLowerCase().includes(search) ? 3 : 0) +
            (a.facets.brand.toLowerCase().includes(search) ? 2 : 0) +
            (a.facets.category.toLowerCase().includes(search) ? 2 : 0) +
            (a.cluster.toLowerCase().includes(search) ? 1 : 0);
          const bScore =
            (b.name.toLowerCase().includes(search) ? 3 : 0) +
            (b.facets.brand.toLowerCase().includes(search) ? 2 : 0) +
            (b.facets.category.toLowerCase().includes(search) ? 2 : 0) +
            (b.cluster.toLowerCase().includes(search) ? 1 : 0);
          return bScore - aScore;
        });
      }
      return products;

    default:
      return products;
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const sort = searchParams.get("sort") || "relevance";

    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!["search", "sort"].includes(key)) {
        filters[key] = value.split(",");
      }
    }

    let products = getProductsData();

    if (Object.keys(filters).length > 0) {
      products = applyFilters(products, filters);
    }

    if (searchTerm) {
      products = applySearch(products, searchTerm);
    }

    products = applySorting(products, sort, searchTerm);

    return NextResponse.json({
      products,
      total: products.length,
      filters: filters,
    });
  } catch (error) {
    console.error("Error processing products request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
