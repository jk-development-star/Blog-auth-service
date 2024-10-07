const mongoose = require("mongoose");

const connectDB = async (DB_URL) => {
    try {
        const DB_OPTIONS = {
            dbName: process.env.DB_NAME,
            family: 4,
            serverSelectionTimeoutMS: 15000, 
            socketTimeoutMS: 45000, 
            connectTimeoutMS: 30000,
        };
        await mongoose
            .connect(DB_URL, DB_OPTIONS)
            .then(() => console.log("Database connected successfully.."))
            .catch((error) => console.log(error));
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = connectDB