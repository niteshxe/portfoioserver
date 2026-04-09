import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Path to the React project's data directory
const DATA_DIR = path.join(__dirname, '../../data');

const getFilePath = (fileName: string) => path.join(DATA_DIR, `${fileName}.json`);

export const getDashboard = (req: Request, res: Response) => {
  const files = ['hero', 'projects', 'resume', 'contact', 'about'];
  res.render('dashboard', { files });
};

export const getEditFile = (req: Request, res: Response) => {
  const fileName = req.params.fileName as string;
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.render('edit', { fileName, data });
};

export const updateFile = (req: Request, res: Response) => {
  const fileName = req.params.fileName as string;
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  try {
    let finalData;

    if (req.body._ui_mode) {
      // Reconstruct data from structured UI forms
      const body = { ...req.body };
      delete body._ui_mode;

      if (fileName === 'hero') {
        const hero = body;
        hero.status.active = hero.status.active === 'true';
        hero.roles = (body.roles as string).split(',').map(r => r.trim());
        hero.metrics = (body.metrics as any[]).map(m => ({
          ...m,
          highlight: m.highlight === 'true'
        }));
        finalData = hero;
      } 
      else if (fileName === 'projects') {
        finalData = (body.projects as any[]).map(p => ({
          ...p,
          id: parseInt(p.id),
          inProgress: p.inProgress === 'true',
          tags: (p.tags as string).split(',').map(t => t.trim())
        }));
      }
      else if (fileName === 'resume') {
        const resume = body;
        resume.skills = (body.skills as any[]).map(s => ({
          ...s,
          items: (s.items as string).split(',').map(i => i.trim())
        }));
        resume.resumeUrl = body.resumeUrl;
        finalData = resume;
      }
      else if (fileName === 'about') {
        const about = body;
        about.skills = (body.skills as string).split(',').map(s => s.trim());
        // Map back about_exp to experience
        about.experience = (body.about_exp as any[]).map(exp => ({
          ...exp,
          id: parseInt(exp.id)
        }));
        delete about.about_exp;
        finalData = about;
      }
      else if (fileName === 'contact') {
        finalData = body;
      }
    } else {
      // Direct Buffer Mode
      finalData = JSON.parse(req.body.jsonContent);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));
    res.redirect(`/edit/${fileName}?success=1`);
  } catch (error) {
    console.error('Save Error:', error);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.render('edit', { fileName, data, error: 'Kernel Panic: Failed to re-index session state. Check input formatting.' });
  }
};
