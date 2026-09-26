import app from "./server";
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log("server is running on PORT :", PORT);

})