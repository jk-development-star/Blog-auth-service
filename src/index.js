import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.config.js";
import authRoutes from "./routes/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
const PORT = process.env.PORT || 3002;
const corsOptions = {
    origin: "http://localhost:3000"
};
const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1.0/blogsite", authRoutes);

connectDB(DATABASE_URL)

/** Error Handler */
app.use((req, res, next) => {
    next(createHttpError(404, 'Request URL not found'));
});

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});