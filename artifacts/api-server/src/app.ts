import express, { type Express } from "express";
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
  app.get("/dashboard/*", (_req, res) => {
    res.sendFile(path.join(dashboardDist, "index.html"));
  });
  app.get("/", (_req, res) => {
    res.redirect("/dashboard");
  });
}

export default app;
