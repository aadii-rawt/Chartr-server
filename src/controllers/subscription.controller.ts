import { Request, Response } from "express";
import rzInstance from "../config/razorpay";

export const createSubscription = async (req: Request, res: Response) => {
   const {planId} = req.body
    
    try {
        const data = await rzInstance.subscriptions.create({
            plan_id: planId,
            customer_notify: true,
            quantity: 1,
            total_count: 12,
        })

        res.json({ msg: "subscription created Succesfully", data })

    } catch (error) {
        console.log(error);
        
        res.status(500).json({ msg: "Something went wrong" })

    }
}