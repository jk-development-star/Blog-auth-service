import Auth from "./src/model/auth.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
const DB_URL = process.env.DATABASE_URL;
import connectDB from "./src/config/db.config.js";
console.log("DB_URL", DB_URL);
connectDB(DB_URL);

// store user infor for login
export const storeUser = async (event) => {
    const input = JSON.parse(event.body);
    const { user_id, user_name, email, password, user_type } = input;
    console.log("INPUT", input);
    const data = { user_id: user_id, user_name: user_name, email: email, password: password, user_type: user_type }
    console.log("data", data);
    try {
        const auth = await Auth.create(data)
        if (auth) {
            return formatResponse(201, { message: "Auth user created successfully!" });
        } else { return formatResponse(400, { message: error.message }); }
    } catch (error) {
        return formatResponse(500, { message: "Internal server error" });
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
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        return formatResponse(500, { message: "Internal server error" });
    }
};


export const verifyToken = (event, callback) => {
    const authHeader = event.authorizationToken;
    console.log("authHeader", authHeader);
    if (!authHeader) {
        return callback(null, 'Authorization header missing');
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jwt.verify(token, 'secret');
        const { user_id, user_name, user_type } = decodedToken;
        event.user = { user_id, user_name, user_type };
        return callback(null, generatePolicy(user_id, 'Allow', event.methodArn));
    } catch (err) {
        return callback('Unauthorized');
    }
};

const generatePolicy = (principalId, effect, resource) => {
    const policy = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource,
            }],
        },
    };

    return policy;
};


function formatResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
