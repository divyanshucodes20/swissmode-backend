import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {server } from "./app.js";

const PORT = process.env.PORT || 8080;

dotenv.config({
    path: ".env",
});

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log("Server is running on Port :", PORT);
        });
    })
    .catch((err) => {
        console.error("MongoDB error : ", err);
    });