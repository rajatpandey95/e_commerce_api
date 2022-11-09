const CustomError = require('../errors');


// this utils method is to prevent a thing i.e.    to prevent user from getting info of other user from .getSingleUser() if he knows the _id  of another user
// eg:- in gla website we can watch anybodies profile picture if we know his/her collegeId   which is a bug

const checkPermissions = (requestUser, resourseUserId) => {

    // console.log(requestUser);
    // console.log(resourseUserId);
    // console.log(typeof resourseUserId);

    if (requestUser.role === 'admin') return;   //means an admin can access
    if (requestUser.userId === resourseUserId.toString()) return;       // means a user can access his own info

    // if both is block fails means if he is not admin and he try to see anyone else info just throw error
    throw new CustomError.UnauthorizedError('Unauthorized Access');


};

module.exports = checkPermissions;