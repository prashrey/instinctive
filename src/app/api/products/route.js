import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = {};
    const sortOption = {};

    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!["search", "sort"].includes(key)) {
        const values = value.split(",");
        if (values.length > 0) {
          filters[key] = { $in: values };
        }
      }
    }

    Object.assign(query, filters);

    const sort = searchParams.get("sort") || "relevant";
    switch (sort) {
      case "price_low_high":
        sortOption.price = 1;
        break;
      case "price_high_low":
        sortOption.price = -1;
        break;
      case "relevant":
      default:
        if (searchTerm) {
          sortOption.score = { $meta: "textScore" };
        }
        break;
    }

    const products = await Product.find(query, searchTerm ? { score: { $meta: "textScore" } } : {})
      .sort(sortOption)
      .lean();

    return NextResponse.json({
      products,
      total: products.length,
      filters: Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.$in])),
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
