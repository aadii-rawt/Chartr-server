import { Request, Response } from "express";
import rzInstance from "../config/razorpay";

export const createPlan = async (req: Request, res: Response) => {

    try {

        const data = await rzInstance.plans.create({
            period: "monthly",
            interval: 2,
            item: {
                name: "Chartr - premium",
                amount: (600 * 100),
                currency: "INR",
                description: "Chartr premium plan for free two month monthly passes"
            },
        })

        res.json({ msg: "Plan created Succesfully", data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" })

    }
}
