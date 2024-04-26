const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/userModels');
const Token = require("../models/tokenModels");

const path = require('path');
const url = require('url');
// const User = mongoose.model('User');


const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config()
// console.log(process.env) // 

const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);











exports.register = async(req,res) => {
    const newUser = new User(req.body);
    let user = await User.findOne({ email: req.body.email });
    if (user) {
    throw new Error("Email already exist");
    }
    newUser.hash_password = bcrypt.hashSync(req.body.password,10);
    try {
        const token = jwt.sign({ email: req.body.email }, 'RESTFULAPIs');
        const savedUser = await newUser.save();
        console.log(savedUser);
        // Handle successful save
        savedUser.hash_password = undefined;
        savedUser.token = token;
        return res.json(savedUser);
      } catch (error) {
        // Handle error
        console.error('Error saving user:', error);
        return res.status(500).json({ error: error });
      }
}

exports.sign_in = async (req, res) => {
    try {
        const findUser = await User.findOne({ email: req.body.email });
        console.log(findUser,'ssssfineUwer')
        if (findUser) {
            console.log(req.body.password)
            console.log(findUser.hash_password)
            const isPasswordValid = bcrypt.compareSync(req.body.password, findUser.hash_password);
            console.log(isPasswordValid,'isPasswordValid')
            if (isPasswordValid) {
                const token = jwt.sign({ _id: findUser._id,email: req.body.email,fullName: findUser.firstName + ' ' +findUser.lastName }, 'RESTFULAPIs',{ expiresIn: '2m' });
                return res.json({ token });
                
            } else {
                return res.status(400).json({ error: 'Invalid password' });
            }
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        // Handle error
        console.error('Error finding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.profile = async(req,res,next) => {
    try {
            if (req.user) {
              res.send(req.user);
              next();
            } 
            else {
             return res.status(401).json({ message: 'Invalid token' });
            }
    } catch (error) {
        // Handle error
        console.error('Error finding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}




exports.sendMail = async(req,res,next) => {
console.log(req.body);



const userEmail = 'user@example.com';
const resetLink = '/http://localhost:5173';


    try {
        const findUser = await User.findOne({ email: req.body.email });
        
        console.log(findUser,'findUser')
        if(findUser){
        const token = jwt.sign({ _id: findUser._id,email: req.body.email,
            fullName: findUser.firstName + ' ' +findUser.lastName }, 'RESTFULAPIs',{ expiresIn: '30s' });
        
        await new Token({
        userId: findUser._id,
        token: token,
        createdAt: Date.now(),
         }).save();

        const link = `${resetLink}/newPassword?token=${token}&id=${findUser._id}`;
        const userName = findUser.firstName + ' ' +findUser.lastName;

        const anchorElement = `
    <p>
        <a href="http://localhost:5173/newPassword?token=${token}&id=${findUser._id}">Reset Password</a>
    </p>
`;



const html = `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        /* Add some styling to your email */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
        }

        h1 {
            color: #333;
        }

        a {
            display: inline-block;
            padding: 10px 15px;
            margin: 20px 0;
            color: white !important;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>

<body>
    <h1>Reset Your Password</h1>
    <p>Hello ${userName},</p>
    <p>We received a request to reset your password. If you did not make this request, you can ignore this email.</p>
    <p>To reset your password, please click the link below:</p>
    <p>${anchorElement}</p>
    <p>If you have any trouble with the link, copy and paste the following URL into your browser:</p>
    <p>${link}</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    <p>Your Team</p>
</body>

</html>`

              

        const transporter = nodemailer.createTransport({
            service:'gmail',
            port:485,
            secure: false,
            auth: {
                user: "azhar.khan@thoughtwin.com",
                pass: 'vgawdmdhlnwtaffs'
             },
            tls: {
                rejectUnauthorized: false,
            }
        });   
        var mailOptions = {
            form:  '<azhar.khan@thoughtwin.com>',
            to: req.body.email,
            subject: 'Reset Password',
            html: html // Path to your HTML file
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            return res.status(200).json({ message: 'Mail Send success' });

            }
          });
        }else{
            return res.status(404).json({ error: 'User not found' });
        }


        
            
    } catch (error) {
        // Handle error
        console.error('Error finding user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


exports.resetPassword = async(req, res, next) => {
    console.log(req.body);
    try {
    let userId = req.body.userId;
    let password = req.body.newPassword;
        if (!userId) {
            console.error('User ID not found in the request body');
            return res.status(400).json({ error: 'User ID is required' });
        }
        // Query the Token collection for the given userId
        let passwordResetToken = await Token.findOne({ userId: userId });
        if (!passwordResetToken) {
        return res.status(404).json({ error: 'Invalid or expired password reset token' })
        } 

        const hash = await bcrypt.hashSync(password,10);
        console.log(hash,'hash');
       let result = await User.updateOne({ _id: userId }, { $set: { hash_password: hash } },{ new: true });
        console.log(result,'resuitl');
          await passwordResetToken.deleteOne();

        return res.status(200).json({ message: 'Password reset success' });



    } catch (error) {
        return error.message;
    }
}




