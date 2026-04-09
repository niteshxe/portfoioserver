import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure the directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set up storage engine using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // We strictly save as resume.pdf to overwrite old versions and maintain neat links
    cb(null, `resume.pdf`);
  }
});

// Create Multer instance
export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
});

const DATA_DIR = path.join(__dirname, '../../data');
const getFilePath = (fileName: string) => path.join(DATA_DIR, `${fileName}.json`);

export const uploadResume = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or file is not a valid PDF.');
  }

  // Update resume.json payload with newly deployed path
  const filePath = getFilePath('resume');
  try {
    const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {};
    
    // We map back to the local backend port structure
    const port = process.env.PORT || 3001;
    data.resumeUrl = `http://localhost:${port}/uploads/resume.pdf`;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // After uploading, return them to the CMS interface
    res.redirect('/edit/resume?success=1');
  } catch (error) {
    console.error('Error updating resume URL:', error);
    res.status(500).send('Critical parsing error processing file upload.');
  }
};
