const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Admin = require("../models/admin");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: "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",
        },
    })
);

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/log-1", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
        },
        validationErrors: [],
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/sign-1", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors: [],
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
console.log(email + password);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/log-1", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
        });
    }

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(422).render("auth/log-1", {
                    path: "/login",
                    pageTitle: "Login",
                    errorMessage: "Invalid email or password.",
                    oldInput: {
                        email: email,
                        password: password,
                    },
                    validationErrors: [],
                });
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.email = user.email;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render("auth/log-1", {
                        path: "/login",
                        pageTitle: "Login",
                        errorMessage: "Invalid email or password.",
                        oldInput: {
                            email: email,
                            password: password,
                        },
                        validationErrors: [],
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const name= req.body.name;
    const regno = req.body.regno;
    const email = req.body.email;
    const dept = req.body.dept;
    const year = req.body.year;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/sign-1", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
            },
            validationErrors: errors.array(),
        });
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
               name: name,
               regno:  regno,
               email: email ,
               dept: dept ,
               year: year ,
               password: hashedPassword ,
             
                
            });
            return user.save();
        })
        .then((result) => {
            res.redirect("/login");
            // return transporter.sendMail({
            //   to: email,
            //   from: 'shop@node-complete.com',
            //   subject: 'Signup succeeded!',
            //   html: '<h1>You successfully signed up!</h1>'
            // });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "No account with that email found.");
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: "shop@node-complete.com",
                    subject: "Password reset",
                    html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            let message = req.flash("error");
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "New Password",
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId,
        })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then((result) => {
            res.redirect("/login");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.getAdminLogin = (req, res, next) => {
   
    res.render("auth/admin-login", {
        path: "/admin-login",
        pageTitle: "Login",
    });
};

exports.postAdminLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
   
    Admin.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(422).render("auth/admin-login", {
                    path: "/admin-login",
                    pageTitle: "Login",
                });
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.email = user.email;
                        req.session.user = user;
                        req.session.Admin = true;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render("auth/admin-login", {
                        path: "/admin-login",
                        pageTitle: "Login",
            
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/admin-login");
                });
        })
     
};

exports.getAdminSignup = (req, res, next) => {
  
    res.render("auth/admin-signup", {
        path: "/signup",
        pageTitle: "Signup",
    });
};


exports.postAdminSignup = (req, res, next) => {
   
    const email = req.body.email;   
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

   

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const data = {
                email : email,
                password:hashedPassword
            }
            Admin.create(data) .then((result) => {
                res.redirect("/admin-login");
                // return transporter.sendMail({
                //   to: email,
                //   from: 'shop@node-complete.com',
                //   subject: 'Signup succeeded!',
                //   html: '<h1>You successfully signed up!</h1>'
                // });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
       
};
