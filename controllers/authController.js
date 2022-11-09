const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {

    // to check if email already exists
    const { email, name, password } = req.body;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError("User already exist");
    }

    // first registered user is an admin
    const isFirstAccount = await User.countDocuments({});
    role = isFirstAccount === 0 ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });

};

const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please enter both email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Incorrect Password" });
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {

    // name of cookie   and change it to any string
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'User Logout' });
};


module.exports = { register, login, logout };