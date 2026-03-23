import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock state for the Comma Four
  let currentMission = "None";
  let robotStatus = {
    battery: 85,
    isBalancing: true,
    lastDetection: "None",
    isSearching: false
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.post("/api/analyze-scene", async (req, res) => {
    const { image } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    try {
      // This would normally call Gemini to describe the office scene
      // For the demo, we'll return a structured AI response
      const mockDescriptions = [
        "I see a modern office space with several workstations. The coffee machine is located to the far left near the window.",
        "The path to the conference room is clear. I detect three humans currently in the common area.",
        "I've identified a potential obstacle: a stray rolling chair at [200, 400]. Recalculating path.",
        "Lighting conditions are optimal. Landmark 'Pizza' is currently obscured by a partition."
      ];
      const description = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
      res.json({ description });
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze scene" });
    }
  });

  app.get("/api/status", (req, res) => {
    res.json({ mission: currentMission, ...robotStatus });
  });

  app.post("/api/mission", (req, res) => {
    const { mission } = req.body;
    currentMission = mission;
    console.log(`New mission set: ${mission}`);
    // In a real setup, this would publish a Cereal message
    res.json({ success: true, mission: currentMission });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
