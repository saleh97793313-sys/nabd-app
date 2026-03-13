import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const dashboardDist = path.resolve(__dirname, "../../clinic-dashboard/dist/public");
  app.use("/dashboard", express.static(dashboardDist));
  app.get("/dashboard/*", (_req, res) => {
    res.sendFile(path.join(dashboardDist, "index.html"));
  });
  app.get("/", (_req, res) => {
    res.redirect("/dashboard");
  });
}

export default app;
