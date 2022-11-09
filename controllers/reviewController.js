const Review = require('../models/Review');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {

    const { product: productId } = req.body;

    const isValidProduct = await Product.findOne({ _id: productId });
    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id:${productId}`);
    }

    // check if user already submitted review for this product
    const alreadySubmitted = await Review.findOne({ product: productId, user: req.user.userId });
    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('Already Submitted Review for this product');
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
}

// we can apply pagination here
const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
        // using .populate() method we can attach more info  but it only work btw two models if they are connected with a 'ref' reference
        .populate({
            path: 'product',
            select: 'name company price'
        })
        .populate({
            path: 'user',
            select: 'name'
        });

    res.status(StatusCodes.OK).json({ NumberOfReviews: reviews.length, reviews });
}
const getSingleReview = async (req, res) => {

    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId })
        .populate({
            path: 'product',
            select: 'name company price'
        })
        .populate({
            path: 'user',
            select: 'name'
        });

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id : ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review });
}
const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId })
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id : ${reviewId}`)
    }

    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review });
}
const deleteReview = async (req, res) => {

    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id : ${reviewId}`)
    }

    // checking is same person who has created this review can delete this
    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: 'Success!' });
}

// get All reviews of a single product
const getSingleProductReview = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ NumberOfReviews: reviews.length, reviews });
}


module.exports = { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReview };