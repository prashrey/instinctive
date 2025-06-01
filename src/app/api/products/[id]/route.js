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

export async function GET(request, { params }) {
  try {
    const products = getProductsData();
    const product = products.find(p => p.id === params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
