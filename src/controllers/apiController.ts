import { Request, Response } from "express";
import Project from "../models/Project";
import PortfolioData from "../models/PortfolioData";
import cache from "../utils/cache";
import { getDefaultData, readBackupData, mergeWithDefaults } from "../utils/defaults";

const getDataOrFallback = async (fileName: string): Promise<any> => {
  let data = null;
  try {
    if (fileName === "projects") {
      const projects = await Project.find().sort({ id: 1 }).lean();
      if (projects && projects.length > 0) data = projects;
    } else {
      const doc = await PortfolioData.findById(fileName).lean();
      if (doc && doc.data) data = doc.data;
    }
  } catch (error) {
    console.error(`Database query failed for ${fileName}, attempting local backup fallback:`, error);
  }

  // Fallback to local backup
  if (!data) {
    data = readBackupData(fileName);
  }

  // Fallback to default schema
  if (!data) {
    data = getDefaultData(fileName);
  }

  // Merge with defaults to ensure all required fields are present
  if (data && fileName !== "projects" && fileName !== "ticker") {
    data = mergeWithDefaults(fileName, data);
  }

  return data;
};

export const getDataFile = async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName as string;
    
    // Try Cache First
    const cachedData = cache.get(`file_${fileName}`);
    if (cachedData) return res.json(cachedData);

    const data = await getDataOrFallback(fileName);

    if (data === null || data === undefined) {
      return res.status(404).json({ error: `Data [${fileName}] not found.` });
    }

    // Save to Cache
    cache.set(`file_${fileName}`, data);
    res.json(data);
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

    let project = null;
    try {
      project = await Project.findOne({ id: idStr }).lean();
    } catch (dbError) {
      console.error(`Database query failed for project id ${idStr}:`, dbError);
    }

    // Fallback to local backup projects if database returned nothing or failed
    if (!project) {
      const backupProjects = readBackupData("projects");
      if (backupProjects && Array.isArray(backupProjects)) {
        project = backupProjects.find((p: any) => String(p.id) === String(idStr)) || null;
      }
    }

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

    console.log("CACHE_MISS: FETCHING_FROM_DB_OR_FALLBACKS...");

    const [hero, projects, resume, contact, about, ticker] =
      await Promise.all([
        getDataOrFallback("hero"),
        getDataOrFallback("projects"),
        getDataOrFallback("resume"),
        getDataOrFallback("contact"),
        getDataOrFallback("about"),
        getDataOrFallback("ticker"),
      ]);

    const result = {
      hero,
      projects,
      resume,
      contact,
      about,
      ticker,
    };

    // Store in Cache
    cache.set("api_all", result);
    
    res.json(result);
  } catch (error) {
    console.error("Data fetch error:", error);
    res.status(500).json({ error: "Failed to aggregate data." });
  }
};


