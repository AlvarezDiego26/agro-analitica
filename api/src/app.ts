import cors from "cors";
import express from "express";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  return app;
}
