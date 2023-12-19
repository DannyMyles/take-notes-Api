const User  = require("../model/User")
const asyncWrapper = require("../middleware/asyncMiddleware")
const errorHandler = require("../middleware/errorHandlerMiddleware")
const bcrypt = require("bcrypt")
const HTTP_STATUS_CODES = require("../utils/statusCodes")
const Note = require("../model/Note")
const { id } = require("date-fns/locale")
// Create a user
const createUser = asyncWrapper(async(req, res)=>{
    const { username, password, roles} = req.body

    // validating data, check if the required fields are being send from the frontend
    if(!username || !password, !Array.isArray(roles), !roles.length){
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({msg:"All fields are required!"})
    }

    // check for duplicates
    const dupUser = await User.findOne({username}).lean().exec()
    if(dupUser){
        return res.status(HTTP_STATUS_CODES.CONFLICT).json({msg: "Duplicate username!"})
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // const newUer = {
    //     username,
    //     "password":hashedPassword,
    //     roles
    // }

    // // Craete the user
    // await User.create(newUer)
    const newUer = new User ({
        username,
        "password":hashedPassword,
        roles
    })

    // Craete the user
    // await User.create(newUer)

    await newUer.save(newUer)

    
    res.status(HTTP_STATUS_CODES.CREATED).json({user: newUer})
})

// Get all users
const getUsers = asyncWrapper(async(req, res)=>{
    // Get all users from the database
    // lean will make sure we get only the json 
    const users = await User.find({}).sort({ createdAt: -1 });
    if(!users){
        return res.status(HTTP_STATUS_CODES.NO_CONTENT).json({})
    }
    res.status(HTTP_STATUS_CODES.OK).json(users)
})

// Update user

const updateUser = asyncWrapper(async (req, res) => {
    const userId = req.params.id;
    const { username, password, roles, active } = req.body;

    // validating data, check if the required fields are being sent from the frontend
    if (!userId || !username || !password || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "All fields are required!" });
    }

    try {
        // Find in the DB then ...
        const user = await User.findById(userId);

        // ... check if he exists
        if (!user) {
            return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: `User not found` });
        }

        // check for duplicates
        const dupUser = await User.findOne({ username }).lean();

        // Allow updates to the original user
        if (dupUser && dupUser._id.toString() !== userId) {
            return res.status(HTTP_STATUS_CODES.CONFLICT).json({ msg: "Duplicate username!" });
        }

        // update
        user.username = username;
        user.roles = roles;
        user.active = active;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        const updatedUser = await user.save();

        res.status(HTTP_STATUS_CODES.CREATED).json({ updatedUser });
    } catch (error) {
        // Handle any errors that might occur during the update process
        console.error("Error updating user:", error);
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ msg: "Internal Server Error" });
    }
});

const deleteUser = asyncWrapper(async(req,res)=>{
    const userId = req.params.id
    const delUser = await User.findByIdAndRemove({userId})
    if(!delUser){
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json('Invalid request')
    }
    res.status(HTTP_STATUS_CODES.NO_CONTENT).json()

    // We do not want to delete a user if assigned to the notes
    const notes = await Note.findOne({user: id}).lean().exec()
    if(notes?.length){
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({msg: "User has assigned notes"}) 
    }

    const user = await User.findById(userId)
    if(!user){
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({msg: 'User does not exist'})
    }

    const result = await User.deleteOne()
    res.status(HTTP_STATUS_CODES.OK).json({result})
})
module.exports = {createUser, getUsers, updateUser, deleteUser}