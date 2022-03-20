const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const errorController = require("./controllers/error");
const User = require("./models/user");
const MONGODB_URI ="mongodb";
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});
const port = process.env.PORT || 3000;
const FileRoutes = require("./routes/fileupload");
app.use(FileRoutes);

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "xls" ||
        file.mimetype === "xlsx"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const eventRoutes = require("./routes/event");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));


app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);








app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated1 = req.session.isLoggedIn;
    // console.log(req.session.isLoggedIn);

    res.locals.Admin = req.session.Admin;
    res.locals.isAdmin = false;

    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err) => {
            next(new Error(err));
        });
});

app.use("/admin", adminRoutes);

app.use(eventRoutes);
app.use(authRoutes);

// app.get("/500", errorController.get500);

// app.use(errorController.get404);

// app.use((error, req, res, next) => {
//     // res.status(error.httpStatusCode).render(...);
//     // res.redirect('/500');
//     res.status(500).render("500", {
//         pageTitle: "Error!",
//         path: "/500",
//         isAuthenticated1: req.session.isLoggedIn,
//         isAuthenticated: req.session.isLoggedIn,
//     });
// });

mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        app.listen(port);
    })
    .catch((err) => {
        console.log(err);
    });
