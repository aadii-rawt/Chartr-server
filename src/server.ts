
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import payuRoutes from "./routes/payu.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// PayU sends callback data as URL-encoded form data.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/payu", payuRoutes);

app.get("/", (req, res) => {
  res.send("Chartr PayU Server Running");
});

const PORT = process.env.PORT || 4000;

export default app