import { Request, Response } from "express";
import Project from "../models/Project";
import PortfolioData from "../models/PortfolioData";

export const getDataFile = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const data = await PortfolioData.findById(fileName);

    if (!data) {
      return res.status(404).json({ error: `Data [${fileName}] not found.` });
    }

    res.json(data.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve data." });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const project = await Project.findOne({ id: parseInt(idStr) });

    if (!project) {
      return res.status(404).json({ error: `Project [${idStr}] not found.` });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve project." });
  }
};

export const getAllData = async (req: Request, res: Response) => {
  try {
    const [heroData, projects, resumeData, contactData, aboutData, tickerData] =
      await Promise.all([
        PortfolioData.findById("hero"),
        Project.find().sort({ id: 1 }),
        PortfolioData.findById("resume"),
        PortfolioData.findById("contact"),
        PortfolioData.findById("about"),
        PortfolioData.findById("ticker"),
      ]);

    const result = {
      hero: heroData?.data || null,
      projects: projects || [],
      resume: resumeData?.data || null,
      contact: contactData?.data || null,
      about: aboutData?.data || null,
      ticker: tickerData?.data || null,
    };

    res.json(result);
  } catch (error) {
    console.error("Data fetch error:", error);
    res.status(500).json({ error: "Failed to aggregate data." });
  }
};
