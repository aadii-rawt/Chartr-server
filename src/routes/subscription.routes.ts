import {Router} from "express"
import { createSubscription } from "../controllers/subscription.controller"


const subscriptionRoutes = Router()

subscriptionRoutes.post("/create",createSubscription )


export default subscriptionRoutes