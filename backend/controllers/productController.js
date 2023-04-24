const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utils/apiFeatures');


// Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError( async (req, res, next) => {
    let images = []
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production" ){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.files.length > 0 ) {
        req.files.forEach(file =>{
            let url = `${BASE_URL}/uploads/product/${file.originalname}`
            images.push({ image: url })
        })
    }
    req.body.images = images;

    req.body.user = req.user.id;
    
    const product= await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })

});

//Get Products - /api/v1/products
exports.getProducts = catchAsyncError(async (req, res, next) =>{
    
        const resPerPage = 3;
        // const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);   
        
        const buildQuery = () =>{
            return new APIFeatures(Product.find(), req.query).search().filter()
        }

        const filteredProductsCount = await buildQuery().query.countDocuments({});
        const totalProductsCount = await Product.countDocuments({}); 
        let productsCount = totalProductsCount;

        if(filteredProductsCount !== totalProductsCount){
            productsCount = filteredProductsCount
        }

        const products = await buildQuery().paginate(resPerPage).query;
           
    
        res.status(200).json({
            success: true,
            count: productsCount,  
            resPerPage,          
            products
            
        })
    }
)

//Get Single Product - /api/v1/product
exports.getSingleProduct = catchAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('reviews.user','name email');
//Validation
    if(!product){
        return next(new ErrorHandler('Product not Found', 400));  //important code Return=> code will close in this loop. Next=> will transfer to next Middleware
    }

      res.status(201).json({
        success: true,
        product
      })
})

//Update Product - /api/v1/product
exports.updateProduct = catchAsyncError( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    //Uploading Images
    let images = []

    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production" ){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    //if Images not Cleared we keep Existing Images
    if(req.body.imagesCleared === false){
        images = product.images;
    }

    
    if(req.files.length > 0 ) {
        req.files.forEach(file =>{
            let url = `${BASE_URL}/uploads/product/${file.originalname}`
            images.push({ image: url })
        })
    }
    req.body.images = images;


// Validation
    if(!product){
        return res.status(404).json({
            success: false,
            message : "Product not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success : true,
        product
    })
})

// Delete Product - /api/v1/product
exports.deleteProduct = catchAsyncError( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }

    await Product.findByIdAndDelete(req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: "Product Deleted"
    })
})

//Create Review - api/v1/review
exports.createReview = catchAsyncError(async(req, res, next) =>{
    const { productId, rating, comment } = req.body;

    const review = {
        user : req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId);
    //Finding User Reviews exists
    const isReviewed = product.reviews.find(review =>{
        return review.user.toString() == req.user.id.toString()
    })

    if(isReviewed){
        //Updating the Review bcs user already has reviewed
        product.reviews.forEach(review =>{
            if(review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }
        })

    }else{
        // Creating the Review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //Find the Average of the Product reviews
    product.ratings = product.reviews.reduce((acc, review) =>{
        return review.rating + acc;
    }, 0) / product.reviews.length;
    
    product.ratings = isNaN(product.ratings)? 0 : product.ratings;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })
})

//Get Reviews - /api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError( async(req, res, next) =>{
    const product = await Product.findById(req.query.id).populate('reviews.user','name email');

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

//Delete Review - /api/v1/review
exports.deleteReview = catchAsyncError(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    //Filtering the Reviews which doesnot match the Deleting review Id
    const reviews = product.reviews.filter(review =>{
        return review._id.toString() !==req.query.id.toString()
    });

    //Number of Reviews
    const numOfReviews = reviews.length;

    //Finding the Average with the Filtered reviews
    let ratings = product.reviews.reduce((acc, review) =>{
        return review.rating + acc;
    }, 0) / product.reviews.length;
    ratings = isNaN(ratings)? 0 : ratings;

    //Save the Product Document
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    })

    res.status(200).json({
        success: true
    })

})


//Get Admin Products  - api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async(req, res, next) => {
    const products = await Product.find();
    res.status(200).send({
        success: true,
        products
    })

})

