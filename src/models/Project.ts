import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    title: String,
    description: String,
    image: String,
    link: String,
    tags: [String],
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "projects" },
);

export default mongoose.model("Project", projectSchema);
