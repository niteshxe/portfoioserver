import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

export const getDataFile = (req: Request, res: Response) => {
  const { fileName } = req.params;
  const filePath = path.join(DATA_DIR, `${fileName}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Kernel data [${fileName}] not found.` });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read kernel data.' });
  }
};

export const getProjectById = (req: Request, res: Response) => {
  const { id } = req.params;
  const filePath = path.join(DATA_DIR, `projects.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Projects data not found.` });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const project = data.find((p: any) => String(p.id) === id);
    if (!project) return res.status(404).json({ error: `Project [${id}] not found.` });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read project data.' });
  }
};

export const getAllData = (req: Request, res: Response) => {
  const files = ['hero', 'projects', 'resume', 'contact', 'about', 'ticker'];
  const result: any = {};

  try {
    files.forEach(file => {
      const filePath = path.join(DATA_DIR, `${file}.json`);
      if (fs.existsSync(filePath)) {
        result[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        result[file] = null;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Unified Fetch Error:', error);
    res.status(500).json({ error: 'Failed to aggregate kernel data.' });
  }
};
