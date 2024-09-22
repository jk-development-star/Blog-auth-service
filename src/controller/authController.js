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
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        await Auth.findOne({ email: email })
            .then((user) => {
                console.log(user);
                if (!user) {
                    return res.status(401).json({
                        message: "Incorrect email address!!",
                    });
                } else {
                    bcrypt.compare(password, user.password)
                        .then(result => {
                            if (result) {
                                const payload = {
                                    user_id: user.user_id,
                                    user_type: user.user_type,
                                    user_name: user.user_name,
                                    expiresIn: 60
                                };
                                const token = jwt.sign(payload, process.env.JWT_KEY);
                                return res.status(200).json({
                                    message: "Authentication successful!",
                                    result: payload,
                                    token: token
                                });
                            } else {
                                return res.status(400).json({
                                    message: "Invalid credentials!"
                                });
                            }
                        })
                        .catch(err => {
                            console.error('Error during password comparison:', err);
                            return res.status(500).json(createHttpError(500, err.message));
                        });
                }
            }).catch((error) =>
                res.status(400).json(createHttpError(400, error.message))
            )
    } catch (error) {
        next(error)
    }
}

