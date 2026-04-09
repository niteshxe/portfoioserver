import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../src/models/Project";
import PortfolioData from "../src/models/PortfolioData";
import Auth from "../src/models/Auth";

dotenv.config();

const goldenData = {
  hero: {
    status: {
      active: true,
      text: "OPERATIONAL // STATUS: ACTIVE"
    },
    title: {
      solid: "NITESH",
      outline: "VASHISHT"
    },
    roles: ["SOFTWARE ENGINEER", "AI ARCHITECT", "FULL-STACK DEVELOPER"],
    metrics: [
      { "label": "EXPERIENCE", "value": "04+", "sub": "YEARS TOTAL", "highlight": false },
      { "label": "PROJECTS", "value": "DYNAMIC", "sub": "LIVE SYSTEM", "highlight": true },
      { "label": "AVALABILITY", "value": "80%", "sub": "OPEN FOR GIGS", "highlight": false }
    ]
  },
  about: {
    subtitle: "CRAFTING HIGH-PERFORMANCE DIGITAL ECOSYSTEMS AT THE INTERSECTION OF DESIGN AND ENGINEERING.",
    paragraphs: [
      "I am Nitesh Kumar Vashisht, a Software Engineer dedicated to building industrial-grade web applications and AI-driven systems. My approach merges brutalist aesthetics with high-velocity performance, ensuring every bit serves a purpose.",
      "With a strong foundation in Full-Stack development and Machine Learning, I specialize in architecting scalable solutions that push the boundaries of current web technologies. From IoT integrations to complex 3D visualizations, I thrive on technical challenges.",
      "Currently based in India, I'm working with cutting-edge startups to redefine user interaction through experimental interfaces and robust backend logic."
    ],
    experience: [
      {
        "id": "exp1",
        "period": "2024 — PRESENT",
        "company": "TECH-X SYSTEMS",
        "role": "SR. FULL-STACK ENGINEER",
        "description": "Leading the development of high-performance dashboards and AI integration modules. Optimizing system architecture for real-time data processing."
      },
      {
        "id": "exp2",
        "period": "2023 — 2024",
        "company": "KINETIC LABS",
        "role": "AI ARCHITECT",
        "description": "Designed and implemented machine learning pipelines for predictive maintenance in industrial IoT environments."
      }
    ],
    skills: ["REACT", "TYPESCRIPT", "NODE.JS", "PYTHON", "GSAP", "THREE.JS", "DOCKER", "AWS", "PYTORCH"]
  },
  projects: [
    {
      "id": "p1",
      "name": "NEURAL CORE",
      "year": "2025",
      "description": "An experimental AI-powered project management system for high-velocity teams. Features real-time task optimization.",
      "tags": ["AI", "NEXT.JS", "GSAP"],
      "link": "https://github.com",
      "inProgress": true
    },
    {
      "id": "p2",
      "name": "VELOCITY",
      "year": "2024",
      "description": "High-performance data visualization engine for real-time market metrics. Sub-10ms latency.",
      "tags": ["THREE.JS", "WEBGL", "RUST"],
      "link": "https://github.com",
      "inProgress": false
    },
    {
      "id": "p3",
      "name": "QUANTUM",
      "year": "2024",
      "description": "Blockchain-based identity verification system with zero-knowledge proofs.",
      "tags": ["WEB3", "SOLIDITY", "REACT"],
      "link": "https://github.com",
      "inProgress": false
    }
  ],
  resume: {
    "resumeUrl": "/resume.pdf",
    "experience": [
      {
        "role": "Senior Software Engineer",
        "company": "Tech-X Systems",
        "year": "2024 — Present",
        "description": "Leading engineering efforts for enterprise AI solutions."
      },
      {
        "role": "AI Specialist",
        "company": "Kinetic Labs",
        "year": "2023 — 2024",
        "description": "Developed proprietary ML models for computer vision."
      }
    ],
    "education": [
      {
        "degree": "B.Tech in Computer Science",
        "institution": "Technical University",
        "year": "2019 — 2023",
        "description": "Specialization in Artificial Intelligence and Data Science."
      }
    ],
    "skills": [
      {
        "category": "LANGUAGES",
        "items": ["TypeScript", "Python", "Rust", "Go", "C++"]
      },
      {
        "category": "FRONTEND",
        "items": ["React", "Next.js", "Three.js", "GSAP", "Tailwind"]
      },
      {
        "category": "BACKEND",
        "items": ["Node.js", "Express", "FastAPI", "PostgreSQL", "Redis"]
      }
    ]
  },
  "contact": {
    "description": "INTERESTED IN COLLABORATING ON EXPERIMENTAL PROJECTS OR HIGH-PERFORMANCE SYSTEMS? LET'S CONNECT.",
    "email": "hello@niteshxe.dev",
    "socials": [
      { "id": "s1", "platform": "GITHUB", "handle": "NITESHXE", "url": "https://github.com" },
      { "id": "s2", "platform": "LINKEDIN", "handle": "NITESHV", "url": "https://linkedin.com" },
      { "id": "s3", "platform": "TWITTER", "handle": "@NITESHXE", "url": "https://twitter.com" }
    ]
  },
  "ticker": [
    { "text": "NITESH VASHISHT", "accent": false },
    { "text": "◆", "accent": true },
    { "text": "SYSTEMS ARCHITECT", "accent": false },
    { "text": "◆", "accent": true },
    { "text": "AVAILABLE FOR Q3 2026", "accent": false },
    { "text": "◆", "accent": true }
  ]
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
    await Auth.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Seed Admin User
    const adminUser = process.env.ADMIN_USER || "admin";
    const adminPass = process.env.ADMIN_PASS || "admin123";
    await Auth.create({ username: adminUser, password: adminPass });
    console.log(`✅ Admin user seeded: ${adminUser}`);

    // Seed Projects (Using string IDs and 'name' field directly)
    await Project.insertMany(goldenData.projects.map(p => ({
        ...p,
        image: "/assets/projects/p1.jpg" // Placeholder
    })));
    console.log("✅ Projects seeded");

    // Seed other data kernels
    const dataEntries = [
      { _id: "hero", data: goldenData.hero },
      { _id: "resume", data: goldenData.resume },
      { _id: "contact", data: goldenData.contact },
      { _id: "about", data: goldenData.about },
      { _id: "ticker", data: goldenData.ticker },
    ];

    await PortfolioData.insertMany(dataEntries);
    console.log("✅ Portfolio data seeded");

    console.log("🎉 Golden Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
