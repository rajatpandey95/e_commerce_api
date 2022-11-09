const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please Provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email'
        },
    },
    password: {
        type: String,
        required: [true, 'Please Provide password'],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],   //means possible value for role
        default: 'user',
    }
});

UserSchema.pre('save', async function () {
    // console.log(this.modifiedPaths());
    // console.log(this.isModified('name'));

    if (!this.isModified('password')) return;      //means if we are not modifing the password then no need to hash again

    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

// here the comparePassword is an instance method
UserSchema.methods.comparePassword = async function (enteredPassword) {
    const isMatch = await bcryptjs.compare(enteredPassword, this.password);
    return isMatch;
}


module.exports = mongoose.model("User", UserSchema);