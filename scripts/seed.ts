import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../src/models/Project";
import PortfolioData from "../src/models/PortfolioData";

dotenv.config();

const initialData = {
  hero: {
    status: {
      text: "OPEN TO OPPORTUNITIES",
      active: true,
    },
    title: {
      solid: "NITESH",
      outline: "KUMAR",
    },
    roles: ["Full Stack Developer", "UI Explorer", "Problem Solver"],
    description: "Creating beautiful web experiences with modern technologies.",
  },
  projects: [
    {
      id: 1,
      title: "Portfolio Website",
      description: "Personal portfolio showcasing projects and skills",
      image: "/assets/project1.png",
      link: "https://github.com/niteshxe/portfolio",
      inProgress: false,
      tags: ["React", "TypeScript", "Vite"],
    },
    {
      id: 2,
      title: "CMS Dashboard",
      description: "Content management system for portfolio",
      image: "/assets/project2.png",
      link: "https://github.com/niteshxe/portfoioserver",
      inProgress: false,
      tags: ["Node.js", "Express", "MongoDB"],
    },
    {
      id: 3,
      title: "API Server",
      description: "RESTful backend API with authentication",
      image: "/assets/project3.png",
      link: "https://github.com/niteshxe/portfoioserver",
      inProgress: true,
      tags: ["Express", "JWT", "MongoDB"],
    },
  ],
  resume: {
    resumeUrl: "https://drive.google.com/your-resume.pdf",
    experience: [
      {
        role: "Full Stack Developer",
        year: "2023 - Present",
        company: "Your Company",
        description:
          "Building scalable web applications with React and Node.js",
      },
      {
        role: "Frontend Developer",
        year: "2022 - 2023",
        company: "Previous Company",
        description: "Developed responsive UI components and web interfaces",
      },
    ],
    education: [
      {
        degree: "B.Tech in Computer Science",
        year: "2023",
        institution: "Your University",
        description: "Focus on web development and software engineering",
      },
    ],
    skills: [
      {
        category: "Frontend",
        items: ["React", "TypeScript", "Tailwind CSS", "GSAP"],
      },
      {
        category: "Backend",
        items: ["Node.js", "Express", "MongoDB", "JWT"],
      },
      {
        category: "Tools",
        items: ["Git", "Docker", "Vite", "Render"],
      },
    ],
  },
  contact: {
    title: "GET IN TOUCH",
    subtitle: "Lets collaborate and create something amazing",
    email: "niteshxe.dev@gmail.com",
    description:
      "Feel free to reach out for any inquiries or collaboration opportunities.",
    socials: [
      {
        id: 1,
        platform: "GitHub",
        handle: "niteshxe",
        url: "https://github.com/niteshxe",
      },
      {
        id: 2,
        platform: "LinkedIn",
        handle: "niteshxe",
        url: "https://linkedin.com/in/niteshxe",
      },
      {
        id: 3,
        platform: "Twitter",
        handle: "niteshxe",
        url: "https://twitter.com/niteshxe",
      },
    ],
  },
  about: {
    title: "ABOUT ME",
    subtitle: "Currently available for work",
    paragraphs: [
      "I am a passionate full-stack developer with expertise in modern web technologies.",
      "I love building beautiful, functional web applications that solve real problems.",
      "Always learning and exploring new technologies to improve my craft.",
    ],
    experience: [
      {
        id: 1,
        role: "Full Stack Developer",
        period: "2023 - Present",
        company: "Current Role",
        description: "Working on various web projects",
      },
    ],
    skills: [
      "React",
      "Node.js",
      "MongoDB",
      "TypeScript",
      "Express",
      "Tailwind CSS",
    ],
  },
  ticker: {
    text: "Currently available for freelance projects • Open to collaborations",
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
