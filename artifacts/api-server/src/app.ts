import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";

let currentDir: string;
try {
  currentDir = path.dirname(fileURLToPath(import.meta.url));
} catch {
  currentDir = __dirname;
}

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const dashboardDist = path.resolve(currentDir, "../../clinic-dashboard/dist/public");
  app.use("/dashboard", express.static(dashboardDist));
  app.get("/dashboard/{*splat}", (_req, res) => {
    res.sendFile(path.join(dashboardDist, "index.html"));
  });
  app.get("/", (_req, res) => {
    res.redirect("/dashboard");
  });
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

export default app;
