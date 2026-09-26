import { Router } from "express";
import { createOrder } from "../controllers/order.controller";

const orderRoutes = Router()

orderRoutes.post('/create', createOrder)


export default orderRoutes;