
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');

// Register User - /api/v1/register 
exports.registerUser = catchAsyncError( async (req, res, next) =>{
     
    const { name, email, password } = req.body    // DeStructuring //
    
    let avatar;

    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production" ){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }


    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    }
    
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });
    // Token (User Registration Token)

    // const token = user.getJwtToken();
    // res.status(201).json({
    //     success: true,
    //     user,
    //     token
    // })

    sendToken(user, 201, res);
});


//LOGIN User - /api/v1/login
exports.loginUser = catchAsyncError(async(req, res, next) =>{
    const{email, password} = req.body

    if (!email || !password){
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // Finding the User in DB
    const user = await User.findOne({email}).select('+password'); // .select('+password') => Password got with SELECT bcs its stopped in "userModel"
    
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    // Validating User details. checking userpassword with DB password
    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid Email or Password', 401))

    }

    sendToken(user, 201, res);    
})


//LOGOUT - /api/v1/logout
exports.logoutUser = (req, res, next) =>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    .status(200)
    .json({
        success: true,
        message: "LoggedOut"
    })
}

//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) =>{
    const  user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler('user not found with this email', 404))
    }
    //Reset Token 
    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})

    let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production" ){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    //create Reset URL
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

    const message = `Your Password reset token url is as follows \n\n
    ${resetUrl} \n\n If you have not requested this email then ignore it. `

    try{
        sendEmail({
            email: user.email,
            subject: 'SHIMcart Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false})
        return next(new ErrorHandler(error.message), 500)
    }
})


//Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError( async (req, res, next) =>{

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // check and verify token got in mail and get user data
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire : {
            $gt : Date.now()
        }
    })

    // will check 
    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or expired in test'))
    }

    //if user details ie token & expire time are valid then will ask for NEW PASSWORD & CONFIRM it
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password doesnot match'))
    }
    
    // Setting Updated Password
    user.password = req.body.password;
    
    //removes these fields
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    //save user details
    await user.save({validateBeforeSave: false})

    // putting Token into Cookies   
    sendToken(user, 201, res)
})

//Get User Profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError( async(req, res, next) =>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
})

//Change Password - /api/v1/password/change
exports.changePassword = catchAsyncError(async(req,res,next) =>{
    const user = await User.findById(req.user.id).select('+password');

    //Check Old Password
    if( ! await user.isValidPassword(req.body.oldPassword) ) {
        return next(new ErrorHandler('Old password is incorrect', 401))        
    }

    //Assinging new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success: true,
        user
    })
})

// Update Profile
exports.updateProfile = catchAsyncError(async(req, res, next)=>{
    let newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    let avatar;

    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production" ){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData, avatar }
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

//ADMIN : Get All Users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async(req, res, next) =>{
    const users = await User.find();
    res.status(200).json({
        success: true,
        users        
    })
})
 
//Admin : Get Specific User - /api/v1/admin/user/:id
exports.getUser = catchAsyncError(async (req, res, next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User not Found with this id:${req.params.id}` ))
    }
    res.status(200).json({
        success: true,
        user
    })
})

//Admin : Update User - /api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async(req, res, next) =>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })    
})

//Admin : Delete User - /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async(req, res, next) =>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User not Found with this id:${req.params.id}` ))
    }
    await user.deleteOne();
    res.status(200).json({
        success: true
    })
})