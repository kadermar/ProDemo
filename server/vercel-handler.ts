import express from "express";
import type { Request, Response } from "express";
import { registerRoutes } from "../server/routes";
import { ensureTables } from "../server/db-setup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routesReady = ensureTables().then(() => registerRoutes(app));

export default async function handler(req: Request, res: Response) {
  await routesReady;
  app(req, res);
}
