import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Project from "../src/models/Project";
import PortfolioData from "../src/models/PortfolioData";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "";
const DATA_PATH = path.resolve(__dirname, "../../portfoio-main/portfoio-main/public/all.json");

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    if (!fs.existsSync(DATA_PATH)) {
      console.error(`Error: all.json not found at ${DATA_PATH}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(DATA_PATH, "utf-8");
    const jsonData = JSON.parse(rawData);

    // 1. Process Projects
    console.log("Migrating projects...");
    await Project.deleteMany({});
    const projectDocs = jsonData.projects.map((p: any) => ({
      ...p,
      // Ensure inProgress is boolean if it exists
      inProgress: !!p.inProgress
    }));
    await Project.insertMany(projectDocs);
    console.log(`Successfully migrated ${projectDocs.length} projects.`);

    // 2. Process Portfolio Sections
    const sections = ["hero", "about", "resume", "contact", "ticker"];
    for (const section of sections) {
      console.log(`Migrating section: ${section}...`);
      await PortfolioData.findByIdAndUpdate(
        section,
        { data: jsonData[section], updated_at: new Date() },
        { upsert: true, new: true }
      );
    }

    console.log("Data migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
