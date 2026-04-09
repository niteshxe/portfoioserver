import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: String,
    year: String,
    description: String,
    image: String,
    link: String,
    tags: [String],
    inProgress: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "projects" },
);

export default mongoose.model("Project", projectSchema);
