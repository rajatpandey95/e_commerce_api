const mongoose = require('mongoose');

// with mongoose 6 and above we do not want to include any extra stuff as it will throw deprication warnings (but if you want you can)
const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
