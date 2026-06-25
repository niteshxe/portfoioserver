import fs from "fs";
import path from "path";

export const getDefaultData = (fileName: string): any => {
  switch (fileName) {
    case "hero":
      return {
        status: { text: "SYS.ONLINE", active: true },
        title: { solid: "PORTFOLIO", outline: "SERVER" },
        roles: ["Full Stack Developer"],
        metrics: []
      };
    case "projects":
      return [];
    case "resume":
      return {
        resumeUrl: "",
        experience: [],
        education: [],
        skills: []
      };
    case "about":
      return {
        title: "About Me",
        subtitle: "",
        paragraphs: [],
        experience: [],
        skills: []
      };
    case "contact":
      return {
        title: "Contact",
        subtitle: "",
        email: "",
        description: "",
        socials: []
      };
    case "ticker":
      return [];
    default:
      return null;
  }
};

const getBackupFilePath = (fileName: string) => {
  // Ensure the directory exists inside the workspace
  const dirPath = path.join(process.cwd(), "src", "db", "backups");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return path.join(dirPath, `backup_${fileName}.json`);
};

export const saveBackupData = (fileName: string, data: any) => {
  try {
    const filePath = getBackupFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`💾 Local backup saved for ${fileName} at ${filePath}`);
  } catch (error) {
    console.error(`Failed to save local backup for ${fileName}:`, error);
  }
};

export const readBackupData = (fileName: string) => {
  try {
    const filePath = getBackupFilePath(fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      console.log(`📖 Loaded local backup for ${fileName}`);
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Failed to read local backup for ${fileName}:`, error);
  }
  return null;
};

export const deepMerge = (target: any, source: any): any => {
  if (source === null || source === undefined) return target;
  if (target === null || target === undefined) return source;

  if (typeof target !== "object" || typeof source !== "object" || Array.isArray(target) || Array.isArray(source)) {
    return source;
  }

  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined) {
      if (typeof source[key] === "object" && source[key] !== null) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};

export const mergeWithDefaults = (fileName: string, data: any): any => {
  const defaults = getDefaultData(fileName);
  return deepMerge(defaults, data);
};

