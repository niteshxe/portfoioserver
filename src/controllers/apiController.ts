import { Request, Response } from "express";
import Project from "../models/Project";
import PortfolioData from "../models/PortfolioData";
import cache from "../utils/cache";

export const getDataFile = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    
    // Try Cache First
    const cachedData = cache.get(`file_${fileName}`);
    if (cachedData) return res.json(cachedData);

    const data = await PortfolioData.findById(fileName).lean();

    if (!data) {
      return res.status(404).json({ error: `Data [${fileName}] not found.` });
    }

    // Save to Cache
    cache.set(`file_${fileName}`, (data as any).data);
    res.json((data as any).data);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve data." });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    
    // Try Cache
    const cachedProject = cache.get(`project_${idStr}`);
    if (cachedProject) return res.json(cachedProject);

    const project = await Project.findOne({ id: idStr }).lean();

    if (!project) {
      return res.status(404).json({ error: `Project [${idStr}] not found.` });
    }

    cache.set(`project_${idStr}`, project);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve project." });
  }
};

export const getAllData = async (req: Request, res: Response) => {
  try {
    // Try Global Cache
    const cachedAll = cache.get("api_all");
    if (cachedAll) return res.json(cachedAll);

    console.log("CACHE_MISS: FETCHING_FROM_DB...");

    const [heroData, projects, resumeData, contactData, aboutData, tickerData] =
      await Promise.all([
        PortfolioData.findById("hero").lean(),
        Project.find().sort({ id: 1 }).lean(),
        PortfolioData.findById("resume").lean(),
        PortfolioData.findById("contact").lean(),
        PortfolioData.findById("about").lean(),
        PortfolioData.findById("ticker").lean(),
      ]);

    const result = {
      hero: (heroData as any)?.data || null,
      projects: projects || [],
      resume: (resumeData as any)?.data || null,
      contact: (contactData as any)?.data || null,
      about: (aboutData as any)?.data || null,
      ticker: (tickerData as any)?.data || null,
    };

    // Store in Cache
    cache.set("api_all", result);
    
    res.json(result);
  } catch (error) {
    console.error("Data fetch error:", error);
    res.status(500).json({ error: "Failed to aggregate data." });
  }
};

