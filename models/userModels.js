var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


const UserSchema = new Schema({
    firstName:{
        type: String,
        trim:true,
        required: true
    },
    lastName:{
        type:String,
        trim:true,
        required: true
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true,
        required: true
    },
    hash_password:{
        type:String
    },
    created:{
        type:Date,
        default:Date.now
    }
});

UserSchema.methods.comparePassword = function(password){
    console.log(password,'password');
    if (!password || !this.hash_password) {
        return false; // Handle the case where either password or hash_password is missing
    }
    return bcrypt.compareSync(password, this.hash_password);
}


const User = mongoose.model('User', UserSchema);
module.exports = User;
