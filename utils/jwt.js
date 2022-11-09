const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');


const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
    return token;
};

const isTokenValid = ({ token }) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, tokenUser }) => {
    const token = createJWT({ payload: tokenUser });

    // now we are not sending token in response with inside response but including it in cookies
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production', // if in production then only we need secure( as secure work with "https" only )   bcoz in devlopment we can go with httpOnly
        signed: true,
    });
}

module.exports = {
    createJWT, isTokenValid, attachCookiesToResponse
}