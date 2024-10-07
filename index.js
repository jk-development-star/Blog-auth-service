const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/route.js");
const handler = require("./handler.js")
const corsOptions = {
     "origin": "http://fse-bucket.s3-website-us-east-1.amazonaws.com"
};
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1.0/blogsite", authRoutes);

app.use(handler)