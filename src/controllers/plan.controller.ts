import { Request, Response } from "express";
import rzInstance from "../config/razorpay";

export const createPlan = async (req: Request, res: Response) => {

    try {

        // const data = await rzInstance.plans.create({
        //     period: "monthly",
        //     interval: 1,
        //     item: {
        //         name: "Chartr - basic",
        //         amount: 10000,
        //         currency: "INR",
        //         description: "Chartr basic plan for 4 free daily passes"
        //     },
        // })
        // const data = await rzInstance.plans.create({
        //     period: "monthly",
        //     interval: 1,
        //     item: {
        //         name: "Chartr - startr",
        //         amount: (200 * 100),
        //         currency: "INR",
        //         description: "Chartr starter plan for free daily passes"
        //     },
        // })

        const data = await rzInstance.plans.create({
            period: "monthly",
            interval: 2,
            item: {
                name: "Chartr - premium",
                amount: (500 * 100),
                currency: "INR",
                description: "Chartr premium plan for free two month monthly passes"
            },
        })

        console.log(data);

        res.json({ msg: "Plan created Succesfully", data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" })

    }
}
