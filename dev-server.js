import express from "express";
import fs from "fs";
import path from "path";
import url from "url";

const app = express();
const PORT = 8000;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const buildPath = path.join(__dirname, "build");

app.use(express.static(buildPath));

// Support loading .html or .js without extension
app.get(/.*/, (req, res) => {
  let requestPath = req.path;
  let base = path.join(buildPath, requestPath);

  // 1. direct match (file with correct extension)
  if (fs.existsSync(base) && fs.lstatSync(base).isFile()) {
    return res.sendFile(base);
  }

  // 2. try .html
  if (!path.extname(requestPath)) {
    const htmlPath = base + ".html";
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }

  // 3. try .js
  if (!path.extname(requestPath)) {
    const jsPath = base + ".js";
    if (fs.existsSync(jsPath)) {
      return res.sendFile(jsPath);
    }
  }

  // 4. fallback to index.html (SPA support)
  return res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () =>
  console.log(`Dev server running at http://localhost:${PORT}`)
);
