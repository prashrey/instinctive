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

export async function GET() {
  try {
    const products = getProductsData();

    const filters = {
      categories: new Set(),
      brands: new Set(),
      priceRanges: new Set(),
      locations: new Set(),
      clusters: new Set(),
    };

    products.forEach(item => {
      filters.categories.add(item.facets.category);
      filters.brands.add(item.facets.brand);
      filters.priceRanges.add(item.facets.priceRange);
      filters.locations.add(item.location);
      filters.clusters.add(item.cluster);
    });

    const response = {
      categories: Array.from(filters.categories).sort(),
      brands: Array.from(filters.brands).sort(),
      priceRanges: Array.from(filters.priceRanges).sort((a, b) => {
        const [aMin] = a.split("-").map(Number);
        const [bMin] = b.split("-").map(Number);
        return aMin - bMin;
      }),
      locations: Array.from(filters.locations).sort(),
      clusters: Array.from(filters.clusters).sort(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
