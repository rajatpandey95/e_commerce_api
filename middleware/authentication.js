const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;

    if (!token) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
    try {
        const { name, userId, role } = isTokenValid({ token });
        req.user = { name, userId, role };
        next();
    }
    catch (error) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
};

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {    // we can access req.user as in first middleware we attach it to request.
            throw new CustomError.UnauthorizedError('Unauthorized to access the route');
        }
        next();
    };
};


module.exports = { authenticateUser, authorizePermissions };