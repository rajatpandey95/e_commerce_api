const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage } = require('../controllers/productController');
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const { getSingleProductReview } = require('../controllers/reviewController');

const express = require('express');
const router = express.Router();


router.route('/')
    .get(getAllProducts)
    .post([authenticateUser, authorizePermissions('admin')], createProduct);

router.route('/uploadImage')
    .post(authenticateUser, authorizePermissions('admin'), uploadImage);


// always put the route with params at last and see if its placed correctly
router.route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
    .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

// get All reviews of a single product
router.route('/:id/reviews').get(getSingleProductReview);

module.exports = router;