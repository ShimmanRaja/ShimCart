const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter Product Name"],
        trim: true,
        maxLenght: [100, "Product Cannot be more than 100 characters"]
    },
    price:{
        type: Number,
        default:0.0
    },
    description:{
        type: String,
        required: [true, "please enter product description"],
    },
    ratings:{
        type: Number,
        default:0
    },
    images:[
        {
            image: {
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required: [true, "please enter product category"],
        enum:{
            values:[
                'Electronics',
                'Mobile Phones',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/shoes',
                'Beaty/Health',
                'Sports',
                'outdoor',
                'Home'
            ],
            message: "please select correct category"
        }
    },
    seller:{
        type: String,
        required: [true,"please enter product seller"]
    },
    stock:{
        type: Number,
        required: [true,"please enter product stock"],
        maxLenght: [20, "Product Stock cannot exceed 20"]
    },
    numofReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            user : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },

            rating:{
                type: String,
                required: true                
            },
            comment:{
                type: String,
                required: true
            }
        }
    ],
    
    user:{
        type: mongoose.Schema.Types.ObjectId
    },

    createdAt:{
        type: Date,
        default: Date.now()
    }

})

let Schema = mongoose.model('Product', productSchema)

module.exports = Schema




