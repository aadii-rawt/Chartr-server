import Razorpay from "razorpay";
import "dotenv/config"
const keyId = process.env.RAZORPAY_KEY_ID || ""
const keySecret = process.env.RAZORPAY_KEY_SECRET || ""

const rzInstance = new Razorpay({ key_id: keyId, key_secret: keySecret })

export default rzInstance