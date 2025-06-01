import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please provide a product category"],
    },
    brand: {
      type: String,
      required: [true, "Please provide a product brand"],
    },
    location: {
      type: String,
      required: [true, "Please provide a product location"],
    },
    cluster: {
      type: String,
      required: [true, "Please provide a product cluster"],
    },
    imageUrl: {
      type: String,
      default: "/product-placeholder.svg",
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, brand: 1, location: 1, cluster: 1 });
productSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
