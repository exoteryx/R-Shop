import bcrypt from 'bcryptjs'
import  jwt  from 'jsonwebtoken';
import UserModel from "../../../Models/UserModel.js";
import cloudinary from '../../../Services/Cloudinary.js';

export const SignUp = async (req,res)=>{
    const {Username, Email, Password, Gender} = req.body
    const Check = await UserModel.findOne({Email});
    if(Check){
        return res.status(409).json({Message:"Email Already Exists"});
    }
    const HashedPass = bcrypt.hashSync(Password,parseInt(process.env.SALTROUND));

    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.APP_NAME}/Users`
    })

    const CreateUser = await UserModel.create({Username,Email,Password:HashedPass,ProfilePicture:{secure_url,public_id},Gender});
    return res.status(200).json({Message:"Success",CreateUser});
}
export const Signin = async (req,res)=>{
    const {Email,Password} = req.body;
    const User = await UserModel.findOne({Email});
    if(!User){
        return res.status(400).json({Message:"Invalid Account"});
    }
    const Match = bcrypt.compareSync(Password,User.Password);
    if(!Match){
        return res.status(400).json({Message:"Invalid Password"});
    }
    const Token = jwt.sign({ID:User._id,Role:User.Role,Status:User.Status},process.env.LOGINSIGNATURE,
        {expiresIn: '5m'});
    const RefreshToken = jwt.sign({ID:User._id,Role:User.Role,Status:User.Status},process.env.LOGINSIGNATURE,
        {expiresIn: 60*60*24})
    return res.status(200).json({Message:"Success",Token,RefreshToken});
}