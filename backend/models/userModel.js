const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');  // used to HASH PASSWORD in DB
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Please enter Name"]
    },
    email: {
        type: String,
        required: [true, "Please enter Email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid Email address"]
    },
    password:{
        type: String,
        required: [true,"Please enter Password"],
        maxlength: [10, "Password cannot exceed 10 characters"],
        select: false  //password will not get while fetching data ie Security reasons
    },
    avatar:{
        type: String
        
    },
    role:{
        type : String,
        default : 'user'
    },

    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,

    createdAt:{
        type: Date,
        default: Date.now
    }
})

//Middleware Function for "HASHing PASSWORD" for security purpose
userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// JSON WEB TOKEN (JWT) Token Generation Fnc using "jwt"
userSchema.methods.getJwtToken = function (){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// Password Validation 
userSchema.methods.isValidPassword = async function(enteredPassword){
    return  bcrypt.compare(enteredPassword, this.password)    
}


userSchema.methods.getResetToken = function(){
    //Generate Token
    const token = crypto.randomBytes(20).toString('hex');

    //Generate Hash & set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    //Set Token Expire Time
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000; // 30 mins expire

    return token
}


let model = mongoose.model('User', userSchema);

module.exports = model;