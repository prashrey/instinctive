import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/instinctive";

async function importData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Reading items.json...");
    const filePath = path.join(process.cwd(), "items.json");

    if (!fs.existsSync(filePath)) {
      throw new Error(`items.json not found at ${filePath}`);
    }

    const fileData = fs.readFileSync(filePath, "utf8");
    let items;
    try {
      items = JSON.parse(fileData);
      console.log(`Successfully parsed ${items.length} items from JSON`);
    } catch (error) {
      throw new Error(`Failed to parse items.json: ${error.message}`);
    }

    console.log("Clearing existing products...");
    await Product.deleteMany({});
    console.log("Cleared existing products");

    console.log("Transforming product data...");
    const transformedProducts = items
      .map((item, index) => {
        if (!item.name) {
          console.warn(`Skipping item at index ${index}: missing required field 'name'`);
          return null;
        }

        let price;
        try {
          if (item.facets?.priceRange) {
            const [minPrice] = item.facets.priceRange.split("-").map(Number);
            price = isNaN(minPrice) ? 0 : minPrice;
          } else if (item.price) {
            price = Number(item.price);
            if (isNaN(price)) price = 0;
          } else {
            price = 0;
          }
        } catch (error) {
          console.warn(`Invalid price for item ${item.name}, defaulting to 0`);
          price = 0;
        }

        return {
          name: item.name,
          description: item.description || "No description available",
          price: price,
          category: item.facets?.category || "Uncategorized",
          brand: item.facets?.brand || "Unknown",
          location: item.location || "Unknown",
          cluster: item.cluster || "Other",
          imageUrl: item.imgUrl || item.imageUrl || "/product-placeholder.svg",
        };
      })
      .filter(product => product !== null);

    console.log(`Attempting to insert ${transformedProducts.length} valid products...`);
    try {
      await Product.insertMany(transformedProducts, { ordered: false });
      console.log(`Successfully imported ${transformedProducts.length} products`);
    } catch (error) {
      if (error.writeErrors) {
        console.error(`Failed to insert ${error.writeErrors.length} products`);
        error.writeErrors.forEach(writeError => {
          console.error(`Error for product: ${writeError.err.op.name}: ${writeError.err.errmsg}`);
        });
      } else {
        throw error;
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
}

importData();
