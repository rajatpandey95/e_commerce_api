require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

// rest of the packages
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const expressRateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

//db
const connectDB = require('./db/connect');

//routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

//middlewares
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//security
app.set("trust proxy", 1); // we need to set it if using proxy like heroku
app.use(
    expressRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 60, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));   //cookie parser also accepts a signature which is used for " signed "  option

app.use(express.static('./public'));
app.use(fileUpload());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

// this sequence matters  first 404 then error
app.use(notFoundMiddleware); // means if user access a not exist route then not-found will handle it
app.use(errorHandlerMiddleware);  // means if inside a route you throw an error


const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port, (req, res) => {
            console.log(`Server started at port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
}

start();