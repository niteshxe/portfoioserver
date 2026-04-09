import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "portfolio_data" },
);

export default mongoose.model("PortfolioData", dataSchema);
