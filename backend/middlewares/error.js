const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;

    // Development side Code & Error Handling
    if(process.env.NODE_ENV == 'development') {

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            stack: err.stack,
            error: err      // used to get error details using stack property used mainly in development time only
        }) 
    }
    //Production Side Code Error Handling
    if(process.env.NODE_ENV == 'production'){

        let message = err.message;
        let error = new Error(message);
         
        // validation Error Message & status for user
        if(err.name == "ValidationError"){
            message = Object.values(err.errors).map(value => value.message) // (value => value.message) will get value of specified propeties of an Object
            error = new Error(message)
            err.statusCode = 400
        }
        // Cast Error
        if(err.name == "CastError"){
            message =  `Resource not Found: ${err.path}`;
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == 11000){
            let message = `Duplicate ${Object.keys(err.keyValue)} error`;
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.name == 'JSONWebTokenError'){
            let message = `JSON Web Token is invalid. Try again`;
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.name == 'TokenExpiredError'){
            let message = `JSON Web Token is Expired.`;
            error = new Error(message)
            err.statusCode = 400
        }


        res.status(err.statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }      
}   
