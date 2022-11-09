
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide rating']
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'Please provide review title'],
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true, 'Please provide review text']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
},
    {
        timestamps: true
    }
);

// to restrict users to only give one review per product

// We can this in two ways
// 1. using Indexing on the schema
// 2. Logic inside controller

// using indexing
reviewSchema.index({ product: 1, user: 1 }, { unique: true });


// aggregate pipeline
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },    // 1st stage
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },    // means calculate average of rating key
                numOfReviews: { $sum: 1 },   //  +1 everytime a review for a product is created
            },
        },   //2nd stage
    ]);
    // console.log(result);


    // now update the values in product schema
    try {
        await this.model('Product').findOneAndUpdate({ _id: productId }, {
            averageRating: Math.ceil(result[0]?.averageRating || 0),         // if a review exists then result will contain some info
            numOfReviews: result[0]?.numOfReviews || 0,
        });
    }
    catch (error) {
        console.log(error);
    }
}

reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product);

});

reviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product);

});


module.exports = mongoose.model("Review", reviewSchema);