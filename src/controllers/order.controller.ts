import { Request, Response } from "express";
import rzInstance from "../config/razorpay";

export const createOrder = async (req: Request, res: Response) => {
    const { amount } = req.body
    try {
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }

        const order = rzInstance.orders.create(options)

        console.log(process.env.RAZORPAY_KEY_ID);
        
        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
            msg: "Order created successfuly"
        })
    } catch (error) {
        res.status(500).json({ success: false, msg: "Something went wrong" })
    }
}


