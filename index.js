import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
// import connectDB from "./src/config/db.config.js";
import authRoutes from "./src/routes/routes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
const PORT = process.env.PORT || 3002;
import handler from "./handler.js"
const corsOptions = {
    origin: 'http://fse-bucket.s3-website-us-east-1.amazonaws.com', // Replace with your React app's domainmethods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // Add other headers if neededoptionsSuccessStatus: 204
  };
// const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1.0/blogsite", authRoutes);

// connectDB(DATABASE_URL)
app.use(handler)

/** Error Handler */
app.use((req, res, next) => {
    next(createHttpError(404, 'Request URL not found'));
});
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});