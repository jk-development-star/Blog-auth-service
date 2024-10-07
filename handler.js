const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Auth = require('./model/auth.js');
const dotenv = require("dotenv");
dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const connectDB = require("./config/db.config.js");
console.log("DB_URL", DB_URL);
connectDB(DB_URL);

module.exports.userLogin = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Credentials': true,
    }
    const input = JSON.parse(event.body);
    try {
        const { email, password } = input;
        console.log("INPUT", email, password, input);
        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email and password are required" })
            };
        }
        const user = await Auth.findOne({ email: email });
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Incorrect email address!" })
            };
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid credentials!" })
            };
        }
        const payload = {
            user_id: user.user_id,
            user_type: user.user_type,
            user_name: user.user_name,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
        };
        const token = jwt.sign(payload, 'secret');
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                message: "Authentication successful!",
                result: payload,
                token: token,
            })
        };
    } catch (error) {
        console.error('Error in loginUser:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }
};

module.exports.verifyAuthToken = (event, context, callback) => {
    const token = event.headers.authorization.split(' ')[1];
    if (!token) {
        return callback(null, {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized" })
        });
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return callback(null, {
                statusCode: 401,
                body: JSON.stringify({ message: "Unauthorized" })
            });
        }
        callback(null, generatePolicy(decoded.user_id, 'Allow', event.methodArn))
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify({ message: "Authorized", user: decoded })
        });
    });
};

const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        };
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};


// store user infor for login
module.exports.storeAuthUser = async (event) => {
    const input = JSON.parse(event.body);
    const { user_id, user_name, email, password, user_type } = input;
    const data = { user_id: user_id, user_name: user_name, email: email, password: password, user_type: user_type }
    try {
        const auth = await Auth.create(data)
        if (auth) {
            return { statusCode: 201, body: JSON.stringify({ message: "Auth user created successfully!" }) };
        } else { return { statusCode: 400, body: JSON.stringify({ message: error.message }) } }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
}
