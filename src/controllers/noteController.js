const Note = require("../model/Note");
const asyncWrapper = require("../middleware/asyncMiddleware");
const HTTP_STATUS_CODES = require("../utils/statusCodes")

// Post/Create note (Allow admin to post note)
const createNote = asyncWrapper(async(req, res) => {
        const { userId, title, desc} = req.body;
        // Create a new note
        const newNote = new Note({
            userId,
            title,
            desc
        });

        const savenote = await newNote.save();
        res.status(HTTP_STATUS_CODES.CREATED).json({ savenote });
});

// get all notes
const getAllNotes = asyncWrapper(async(req, res) => {
    const notes = await Note.find({}).sort({ createdAt: -1 });
    if (!notes) {
        res.status(HTTP_STATUS_CODES.OK).json({});
    }
    res.status(HTTP_STATUS_CODES.CREATED).json({ notes });
});

// get a note
const getSingleNote = asyncWrapper(async(req, res) => {
    // get the noteId from the params
    const noteId = req.params.id;
    const note = await note.findById(noteId);

    if (!note) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: `No note with this Id ${noteId}` });
    }
    res.status(HTTP_STATUS_CODES.OK).json({ note });
});

// Update note
const updateNote = asyncWrapper(async(req, res) => {
    const noteId = req.params.id;
    const noteBody = req.query;
    const note = await Note.findOneAndUpdate({ _id: noteId }, noteBody, {
        new: true
    });

    if (!note) {
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: `No note with this Id ${noteId}` })
    }
    res.status(HTTP_STATUS_CODES.CREATED).json({ note })
})

// Delete note
const deleteNote = asyncWrapper(async(req, res) => {
        const noteId = req.params.id;
        const note = await Note.findByIdAndDelete(noteId);

        if (!note) {
            return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ msg: `No note with this ID ${noteId}` });
        }

        res.status(HTTP_STATUS_CODES.NO_CONTENT).json(); // Use status code 204 for a successful deletion with no content.
});
module.exports = { createNote, getAllNotes, getSingleNote, updateNote, deleteNote };