import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const [categories, brands, locations, clusters] = await Promise.all([
      Product.distinct("category"),
      Product.distinct("brand"),
      Product.distinct("location"),
      Product.distinct("cluster"),
    ]);

    const products = await Product.find({}, { price: 1 }).lean();
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceStep = (maxPrice - minPrice) / 4;
    const priceRanges = [];
    for (let i = 0; i < 4; i++) {
      const start = Math.round(minPrice + priceStep * i);
      const end = Math.round(minPrice + priceStep * (i + 1));
      priceRanges.push(`${start}-${end}`);
    }

    const response = {
      categories: categories.sort(),
      brands: brands.sort(),
      locations: locations.sort(),
      clusters: clusters.sort(),
      priceRanges: priceRanges.sort((a, b) => {
        const [aMin] = a.split("-").map(Number);
        const [bMin] = b.split("-").map(Number);
        return aMin - bMin;
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
