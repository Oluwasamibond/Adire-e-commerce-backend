import mongoose from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please provide your name'],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [25, 'Name must be at most 25 characters long']
    },
    email:{
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'], 
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },

    role:{
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
})

// Password hasing
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
})

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

userSchema.methods.verifyPassword = async function(userEnteredPassword){
    return await bcryptjs.compare(userEnteredPassword, this.password);
}

// generate token
userSchema.methods.generatePasswordResetToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

export default mongoose.model('User', userSchema);