import Auth from "../model/auth.js"
import createHttpError from "http-errors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// store user infor for login
export const storeUser = async (req, res) => {
    try {
        await Auth.create(req.body).then(() =>
            res.status(201).json({ message: "user info added successfully." })
        ).catch((error) =>
            res.status(400).json(createHttpError(400, error.message))
        )
    } catch (error) {
        next(Error)
    }
}

//login user
export const loginUser = async (event) => {
    const input = JSON.parse(event.body);
    try {
        const { email, password } = input;
        console.log("INPUT", email, password, input);
        if (!email || !password) {
            return formatResponse(400, { message: "Email and password are required" });
        }
        const user = await Auth.findOne({ email: email });
        if (!user) {
            return formatResponse(401, { message: "Incorrect email address!" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return formatResponse(400, { message: "Invalid credentials!" });
        }
        const payload = {
            user_id: user.user_id,
            user_type: user.user_type,
            user_name: user.user_name,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
        };
        const token = jwt.sign(payload, 'secret');
        return formatResponse(200, {
            message: "Authentication successful!",
            result: payload,
            token: token,
            headers: {
                "Access-Control-Allow-Origin": "http://fse-bucket.s3-website-us-east-1.amazonaws.com/",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Access-Control-Max-Age",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Credentials": true
            },
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        return formatResponse(500, { message: "Internal server error" });
    }
};
}

