import { Request, Response } from "express";
import Project from "../models/Project";
import PortfolioData from "../models/PortfolioData";
import cache from "../utils/cache";

export const getDashboard = (req: Request, res: Response) => {
  const files = ["hero", "projects", "resume", "contact", "about", "ticker"];
  res.render("dashboard", { files });
};

export const getEditFile = async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName as string;

    let data;
    if (fileName === "projects") {
      const projects = await Project.find().sort({ id: 1 });
      data = projects;
    } else {
      const docData = await PortfolioData.findById(fileName);
      data = docData ? docData.data : null;
    }

    if (!data) {
      return res.status(404).send("Data not found");
    }

    res.render("edit", { fileName, data });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error loading data");
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName as string;

    let finalData;

    if (req.body._ui_mode) {
      // Reconstruct data from structured UI forms
      const body = { ...req.body };
      delete body._ui_mode;

      if (fileName === "hero") {
        const hero = body;
        hero.status = hero.status || {};
        hero.status.active = hero.status.active === "true";
        hero.roles = (body.roles as string).split(",").map((r) => r.trim());
        // Handle metrics if present
        if (body.metrics) {
            hero.metrics = Object.values(body.metrics).map((m: any) => ({
                ...m,
                highlight: m.highlight === "true"
            }));
        }
        finalData = hero;
      } else if (fileName === "projects") {
        if (body.projects) {
            finalData = Object.values(body.projects).map((p: any) => ({
                ...p,
                id: p.id,
                inProgress: p.inProgress === "true",
                tags: (p.tags as string).split(",").map((t) => t.trim()),
            }));
        } else {
            finalData = [];
        }
      } else if (fileName === "resume") {
        const resume = body;
        if (body.experience) {
            resume.experience = Object.values(body.experience);
        } else {
            resume.experience = [];
        }
        if (body.education) {
            resume.education = Object.values(body.education);
        } else {
            resume.education = [];
        }
        if (body.skills) {
          resume.skills = Object.values(body.skills).map((s: any) => ({
            ...s,
            items: (s.items as string).split(",").map((i) => i.trim()),
          }));
        } else {
            resume.skills = [];
        }
        finalData = resume;
      } else if (fileName === "about") {
        const about = body;
        about.skills = (body.skills as string).split(",").map((s) => s.trim());
        if (body.about_exp) {
            about.experience = Object.values(body.about_exp).map((exp: any) => ({
                ...exp,
                id: exp.id,
            }));
        } else {
            about.experience = [];
        }
        delete about.about_exp;
        finalData = about;
      } else if (fileName === "contact") {
        if (body.socials) {
            body.socials = Object.values(body.socials).map((s: any) => ({
                ...s,
                id: s.id
            }));
        } else {
            body.socials = [];
        }
        finalData = body;
      } else if (fileName === "ticker") {
        if (body.ticker) {
          finalData = Object.values(body.ticker).map((s: any) => ({
            ...s,
            accent: s.accent === "true",
          }));
        } else {
          finalData = [];
        }
      }
    } else {
      // Direct Buffer Mode (JSON content)
      finalData = JSON.parse(req.body.jsonContent);
    }

    // Save to MongoDB
    if (fileName === "projects") {
      // Clear and re-insert projects
      await Project.deleteMany({});
      if (finalData.length > 0) {
        await Project.insertMany(finalData);
      }
    } else {
      // Update or create document in PortfolioData
      await PortfolioData.findByIdAndUpdate(
        fileName,
        { data: finalData, updated_at: new Date() },
        { upsert: true, new: true },
      );
    }

    // Clear Cache to force refresh on next API call
    cache.flushAll();
    console.log("CACHE_FLUSHED: SYSTEM_STATE_UPDATED");

    res.redirect(`/edit/${fileName}?success=1`);
  } catch (error) {
    console.error(`ERROR: FAILED_TO_UPDATE_FILE [${req.params.fileName}]`);
    console.error(error);
    res.status(500).send("Failed to update data. Check your terminal logs for specific formatting errors.");
  }
};

