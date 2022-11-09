const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');


const fakeStripeAPI = async ({ amount, currency }) => {
    const clientSecret = 'someRandomValue';
    return { clientSecret, amount };
}


const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;
    if (!cartItems || cartItems.length < 1) {
        throw new CustomError.BadRequestError('No Cart Items Present');
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('Please Provide tex and shipping fee');
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No product with id : ${item.product}`);
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name, price, image, product: _id,
        };
        // add item to order
        orderItems = [...orderItems, singleOrderItem];
        //calculate subtotal
        subtotal += item.amount * price;
    }

    const total = tax + shippingFee + subtotal;

    //get clientSecret
    const paymenyIntent = await fakeStripeAPI({
        amount: total,
        currency: 'inr',
    });

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymenyIntent.clientSecret,
        user: req.user.userId,
    });

    res.status(StatusCodes.OK).json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ NumberOfOrders: orders.length, orders });
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }

    checkPermissions(req.user, order.user);

    res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId });
    res.status(StatusCodes.OK).json({ NumberOfOrders: orders.length, orders })
}
const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }

    checkPermissions(req.user, order.user);

    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';

    await order.save();

    res.status(StatusCodes.OK).json({ order })

}

module.exports = { createOrder, getAllOrders, getSingleOrder, getCurrentUserOrders, updateOrder };