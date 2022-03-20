const path = require("path");

const express = require("express");

const eventController = require("../controllers/fileupload");
const isAuth = require("../middleware/is-auth");

const router = express.Router();


router.get('/upload-participant-file',eventController.getparticipantFile);

router.get('/upload-participant',eventController.getparticipantUpload)

router.post('/upload-participant',eventController.postparticipantUpload)

router.get('/upload-winner-file',eventController.getwinnerFile);

router.get('/upload-winner',eventController.getwinnerUpload)

router.post('/upload-winner',eventController.postwinnerUpload)

module.exports = router;