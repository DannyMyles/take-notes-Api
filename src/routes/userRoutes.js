const express = require("express")
const usersController = require("../controllers/userController")
const router = express.Router()


router.route('/users').get(usersController.getUsers).post(usersController.createUser)
router.route('/user/:id').put(usersController.updateUser).delete(usersController.deleteUser)

module.exports = router