const express = require("express")
const router = express.Router()
const noteControllers = require("../controllers/noteController")

router.route("/notes").get(noteControllers.getAllNotes).post(noteControllers.createNote)
router.route("/notes/:id").put(noteControllers.updateNote).delete(noteControllers.deleteNote).get(noteControllers.getSingleNote)

module.exports = router