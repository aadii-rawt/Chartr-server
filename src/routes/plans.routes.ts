import { Router } from "express";
import { createPlan } from "../controllers/plan.controller";

const plansRouter = Router()


plansRouter.post("/create", createPlan)


export default plansRouter