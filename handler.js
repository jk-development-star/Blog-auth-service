const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Auth = require("./model/auth.js");
const User = require("./model/user.js");
const dotenv = require("dotenv");
const {
  emailConflictError,
  validationError,
} = require("./middleware/errorHandler.js");
dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const connectDB = require("./config/db.config.js");
console.log("DB_URL", DB_URL);
connectDB(DB_URL);

module.exports.userLogin = async (event) => {
  const input = JSON.parse(event.body);
  try {
    const { email, password } = input;
    console.log("INPUT", email, password, input);
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and password are required" }),
      };
    }
    const user = await Auth.findOne({ email: email });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Incorrect email address!" }),
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid credentials!" }),
      };
    }
    console.log(user);
    const payload = {
      user_id: user.user_id,
      user_type: user.user_type,
      user_name: user.user_name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };
    const token = jwt.sign(payload, "secret");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Authentication successful!",
        result: payload,
        token: token,
      }),
    };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

module.exports.authorizer = async (event) => {
  console.log("event", event);
  const token = event.authorizationToken.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secret");
    const userId = decoded.user_id;
    return generatePolicyDocument(userId, "Allow", event.methodArn, {
      token: token,
      userType: decoded.user_type,
      userId: decoded.user_id,
    });
  } catch (error) {
    console.log("Error in authorizer", error);
    return generatePolicyDocument("user", "Deny", event.methodArn, {});
  }
};

const generatePolicyDocument = (principalId, effect, resource, context) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  authResponse.context = context || {};
  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  if (context) authResponse.context = context;
  return authResponse;
};

module.exports.userRegister = async (event) => {
  const input = JSON.parse(event.body);
  let { user_name, email, password, user_type } = input;
  user_type = user_type === undefined ? "user" : user_type;
  const dataOne = { user_name, email, password, user_type };
  console.log("dataOne", dataOne);
  try {
    const user = await User.create(dataOne);
    if (user) {
      return {
        statusCode: 201,
        body: JSON.stringify({ message: "User created successfully!" }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Something went wrong!" }),
      };
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: validationError(error) }),
      };
    }
    if (error.code === 11000) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: emailConflictError(error) }),
      };
    }
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};

module.exports.getUserById = async (event) => {
  const { id } = event.pathParameters;
  try {
    const user = await User.findById(id).select("user_name -_id");
    if (user) {
      return { statusCode: 200, body: JSON.stringify(user) };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found!" }),
      };
    }
  } catch (error) {
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};
