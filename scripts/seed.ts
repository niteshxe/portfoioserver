import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../src/models/Project";
import PortfolioData from "../src/models/PortfolioData";

dotenv.config();

const initialData = {
  hero: {
    name: "Nitesh Kumar",
    title: "Full Stack Developer",
    description: "Building web experiences with React, Node.js, and MongoDB",
    cta: "View My Work",
  },
  projects: [
    {
      id: 1,
      title: "Portfolio Website",
      description: "Personal portfolio showcasing projects and skills",
      image: "/assets/project1.png",
      link: "https://github.com/niteshxe/portfolio",
      tags: ["React", "TypeScript", "Vite"],
    },
    {
      id: 2,
      title: "CMS Dashboard",
      description: "Content management system for portfolio",
      image: "/assets/project2.png",
      link: "https://github.com/niteshxe/portfoioserver",
      tags: ["Node.js", "Express", "MongoDB"],
    },
    {
      id: 3,
      title: "API Server",
      description: "RESTful backend API with authentication",
      image: "/assets/project3.png",
      link: "https://github.com/niteshxe/portfoioserver",
      tags: ["Express", "JWT", "MongoDB"],
    },
  ],
  resume: {
    email: "niteshxe.dev@gmail.com",
    phone: "+91-XXXXXXXXXX",
    location: "India",
    experience: [
      {
        title: "Full Stack Developer",
        company: "Your Company",
        duration: "2023 - Present",
        description: "Building scalable web applications",
      },
    ],
    education: [
      {
        degree: "B.Tech",
        school: "Your University",
        year: "2023",
      },
    ],
  },
  contact: {
    email: "niteshxe.dev@gmail.com",
    phone: "+91-XXXXXXXXXX",
    github: "https://github.com/niteshxe",
    linkedin: "https://linkedin.com/in/niteshxe",
    twitter: "https://twitter.com/niteshxe",
  },
  about: {
    bio: "I am a full-stack developer passionate about building web applications.",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Express",
      "Tailwind CSS",
    ],
    interests: ["Web Development", "Open Source", "Problem Solving"],
  },
  ticker: {
    text: "Currently available for freelance projects",
    link: "/contact",
  },
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not set in environment");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Project.deleteMany({});
    await PortfolioData.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Seed Projects
    await Project.insertMany(initialData.projects);
    console.log("✅ Projects seeded");

    // Seed other data
    const dataEntries = [
      { _id: "hero", data: initialData.hero },
      { _id: "resume", data: initialData.resume },
      { _id: "contact", data: initialData.contact },
      { _id: "about", data: initialData.about },
      { _id: "ticker", data: initialData.ticker },
    ];

    await PortfolioData.insertMany(dataEntries);
    console.log("✅ Portfolio data seeded");

    console.log("🎉 Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
