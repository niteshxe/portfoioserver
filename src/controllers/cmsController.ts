import { Request, Response } from "express";
import Project from "../models/Project";
import PortfolioData from "../models/PortfolioData";

export const getDashboard = (req: Request, res: Response) => {
  const files = ["hero", "projects", "resume", "contact", "about"];
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
        finalData = hero;
      } else if (fileName === "projects") {
        finalData = (body.projects as any[]).map((p) => ({
          ...p,
          id: parseInt(p.id),
          inProgress: p.inProgress === "true",
          tags: (p.tags as string).split(",").map((t) => t.trim()),
        }));
      } else if (fileName === "resume") {
        const resume = body;
        resume.skills = (body.skills as any[]).map((s) => ({
          ...s,
          items: (s.items as string).split(",").map((i) => i.trim()),
        }));
        resume.resumeUrl = body.resumeUrl;
        finalData = resume;
      } else if (fileName === "about") {
        const about = body;
        about.skills = (body.skills as string).split(",").map((s) => s.trim());
        about.experience = (body.about_exp as any[]).map((exp) => ({
          ...exp,
          id: parseInt(exp.id),
        }));
        delete about.about_exp;
        finalData = about;
      } else if (fileName === "contact") {
        finalData = body;
      }
    } else {
      // Direct Buffer Mode (JSON content)
      finalData = JSON.parse(req.body.jsonContent);
    }

    // Save to MongoDB
    if (fileName === "projects") {
      // Clear and re-insert projects
      await Project.deleteMany({});
      await Project.insertMany(finalData);
    } else {
      // Update or create document in PortfolioData
      await PortfolioData.findByIdAndUpdate(
        fileName,
        { data: finalData, updated_at: new Date() },
        { upsert: true, new: true },
      );
    }

    res.redirect(`/edit/${fileName}?success=1`);
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).send("Failed to update data. Check your input formatting.");
  }
};
