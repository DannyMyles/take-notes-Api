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
    // !Array.isArray(roles),, this checks if roles is not an array
    if(!username || !password, !Array.isArray(roles), !roles?.length){
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({msg:"All fields are required!"})
    }

    // check for duplicates
    const dupUser = await User.findOne({username}).lean().exec()
    if(dupUser){
        return res.status(HTTP_STATUS_CODES.CONFLICT).json({msg: "Duplicate username!"})
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10) //salt rounds
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

    console.log("user created", newUer)
    res.status(HTTP_STATUS_CODES.CREATED).json({user: newUer})
})

// Get all users
const getUsers = asyncWrapper(async(req, res)=>{
    // Get all users from the database
    // lean will make sure we get only the json 
    // select('-password'), this means I do not to want to get the users password
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();

    // check if we have users 
    if(!users){
        return res.status(HTTP_STATUS_CODES.NO_CONTENT).json({})
    }
    res.status(HTTP_STATUS_CODES.OK).json(users)
})

// Update user

const updateUser = asyncWrapper(async (req, res) => {
    const {id, username, password, roles, active } = req.body;

    // validating data, check if the required fields are being sent from the frontend
    if (!id || !username || !password || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ msg: "All fields are required!" });
    }

    try {
        // Find in the DB then ...
        const user = await User.findById(id);

        // ... check if he exists
        if (!user) {
            return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: `User not found` });
        }

        // check for duplicates
        const dupUser = await User.findOne({ username }).lean().exec();

        // Allow updates to the original user
        if (dupUser && dupUser._id.toString() !== id) {
            return res.status(HTTP_STATUS_CODES.CONFLICT).json({ msg: "Duplicate username!" });
        }

        // update
        user.username = username;
        user.roles = roles;
        user.active = active;

        if (password) {
            const salt = await bcrypt.genSalt(10); //salt rounds
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

const deleteUser = asyncWrapper(async (req, res) => {
    const userId = req.body.userId; // Use req.body.userId instead of req.body
  
    if (!userId) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ msg: 'UserID is required in the request body' }); // Use BAD_REQUEST instead of NOT_FOUND
    }
  
    // We do not want to delete a user if assigned to the notes
    const notes = await Note.find({ user: userId }).lean().exec(); // Use userId instead of id
    if (notes.length > 0) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ msg: 'User has assigned notes' });
    }
  
    // Define our user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: 'User does not exist' });
    }
  
    // Remove the user
    const result = await User.findByIdAndRemove(userId); // Use findByIdAndRemove directly
  
    if (!result) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .json({ msg: 'User not found or already deleted' });
    }
  
    res.status(HTTP_STATUS_CODES.OK).json({ msg: 'User was deleted successfully!' });
  });
  
module.exports = {createUser, getUsers, updateUser, deleteUser}