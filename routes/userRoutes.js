const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require('../controllers/userController');

const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const express = require('express');
const router = express.Router();

// authorizePermissions means only admin,owner (particular roles) can access some routes
// but first we need to authenticate User
router.route('/').get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

// middleware also
router.route('/:id').get(authenticateUser, getSingleUser);


module.exports = router;