const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const User = require('../models/User');
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' }, { password: 0 });
    res.status(StatusCodes.OK).json({ users });
}

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }, { password: 0 });
    if (!user) {
        throw new CustomError.NotFoundError("User does not exists");
    }

    checkPermissions(req.user, user._id);

    res.status(StatusCodes.OK).json({ user });
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
}

const updateUser = async (req, res) => {

    const { email, name } = req.body;

    if (!email || !name) {
        throw new CustomError.BadRequestError("Pleasr provide all values");
    }

    // we should use .findOneAndUpdate() instead of .save()  as .save() with call the .pre() hook in schema and it will hash the hashed password again thus creating error in password
    const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name }, { new: true, runValidators: true });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const updateUserPassword = async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please enter old and new password');
    }

    const user = await User.findOne({ _id: req.user.userId });

    const isOldPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isOldPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    user.password = newPassword;
    await user.save();    // this will automaticaly encrpt the password

    res.status(StatusCodes.OK).json({ msg: "Password Updated" });
}


module.exports = { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword };


