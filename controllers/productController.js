const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
}

// we need to apply pagination here
const getAllProducts = async (req, res) => {
    const products = await Product.find({}).populate('reviews');;
    res.status(StatusCodes.OK).json({ NumberOfProducts: products.length, products });
}

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate('reviews');
    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
}

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOneAndUpdate({ _id: productId }, req.body, { new: true, runValidators: true });
    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    await product.remove();  // we use .remove() here so that it triggers .pre(remove) hook
    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
}

const uploadImage = async (req, res) => {

    if (!req.files) {
        throw new CustomError.BadRequestError("No file uploaded");
    }

    const productImage = req.files.image;
    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError("Please Upload an image");
    }


    const maxSize = 1024 * 1024;
    if (productImage.size > maxSize) {
        throw new CustomError.BadRequestError('Please Upload an image size < 1MB');
    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({
        image: {
            src: `/uploads/${productImage.name}`
        }
    });
}

module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage };