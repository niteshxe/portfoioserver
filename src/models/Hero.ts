import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    description: String,
    cta: String,
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "hero" },
);

export default mongoose.model("Hero", heroSchema);
