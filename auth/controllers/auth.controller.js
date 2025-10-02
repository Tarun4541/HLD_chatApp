import User from "../models/user.model.js" ;
import bcrypt from "bcrypt"
import generateJWTTokenAndSetCookie from "../utils/generateToken.js";

const singup = async(req,res) => {
    try {
        const {username, password} = req.body;
        const hashedpassword = await bcrypt.hash(password,10);

        const foundUser = await User.findOne({username});
        if(foundUser) {
            res.status(201).json({message: 'User already exist'});
        }
        else {
            const user = new User({username: username, password: hashedpassword});
            console.log(user);
            await user.save();
            generateJWTTokenAndSetCookie(user._id, res);
            res.status(201).json({message: 'User signed up successfully'});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: "User reg failed!"});
    }

}

export const login = async (req,res) => {
    try {
        const {username,password} = req.body;
        const foundUser = await User.findOne({username});
        if(!foundUser) {
            res.status(401).json({message: 'Auth failed'});
        }
        else {
            const passwordMatch = await bcrypt.compare(password, foundUser?.password);
            if(!passwordMatch) {
                res.status(401).json({message: 'Auth failed'});
            }
            generateJWTTokenAndSetCookie(foundUser._id, res);
            res.status(201).json({_id: foundUser._id, username: foundUser.username});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: "User Login failed!"});
    }

}

export default singup;