import express from "express";
import plansRouter from "./routes/plans.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import cors from "cors"
import dotenv from "dotenv"
import orderRoutes from "./routes/order.routes";


const app = express();

// app.use(dotenv.config)
app.use(express.json())
app.use(cors({
    origin: "*"
}))


app.get("/api/health", (req, res) => {
    res.json({ msg: "server is running..." })
})

app.use("/api/plan", plansRouter)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/order", orderRoutes)


export default app