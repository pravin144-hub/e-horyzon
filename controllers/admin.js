const mongoose = require("mongoose");

const fileHelper = require("../util/file");

const { validationResult } = require("express-validator");

const Product = require("../models/event");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-event", {
        pageTitle: "Add Product",
        path: "/admin/add-event",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const officialBody = req.body.officialBody;
    const title = req.body.title;
    const image = req.file;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const status = req.body.status;
    const description = req.body.description;
    const co_name1 = req.body.co_name1;
    const co_name2 = req.body.co_name2;
    const co_mobile1= req.body.co_mobile1;
    const co_mobile2= req.body.co_mobile2;
    
    if (!image) {
        return res.status(422).render("admin/edit-event", {
            pageTitle: "Add Product",
            path: "/admin/add-event",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: "Attached file is not an image.",
            validationErrors: [],
        });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("admin/edit-event", {
            pageTitle: "Add Product",
            path: "/admin/add-event",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
        officialBody : officialBody ,
        title :title ,
        imageUrl :imageUrl,
        startdate : startdate,
        enddate : enddate ,
        status :status,
        co_name1:co_name1,
        co_mobile1:co_mobile1,
        co_name2:co_name2,
        co_mobile2:co_mobile2,
        description : description,
       
    });
    product
        .save()
        .then((result) => {
            // console.log(result);
            console.log("Created Product");
            res.redirect("/admin/events");
        })
        .catch((err) => {
            // return res.status(500).render('admin/edit-event', {
            //   pageTitle: 'Add Product',
            //   path: '/admin/add-event',
            //   editing: false,
            //   hasError: true,
            //   product: {
            //     title: title,
            //     imageUrl: imageUrl,
            //     price: price,
            //     description: description
            //   },
            //   errorMessage: 'Database operation failed, please try again.',
            //   validationErrors: []
            // });
            // res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
       
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return res.redirect('/');
            }
            res.render("admin/edit-event", {
                pageTitle: "Edit Product",
                path: "/admin/edit-event",
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const officialBody = req.body.officialBody;
    const title = req.body.title;
    
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const status = req.body.status;
    const description = req.body.description;
    const co_name1 = req.body.co_name1;
    const co_name2 = req.body.co_name2;
    const co_mobile1= req.body.co_mobile1;
    const co_mobile2= req.body.co_mobile2;
    console.log("sssss:"+status)
    const prodId = req.params.productId;
    const data = {
        title: req.body.up1,
        officialBody: req.body.up2,
        description: req.body.up3,
    }
    Product.findOneAndUpdate(data, {$set: {"officialBody": officialBody,
    "title":title,
    "startdate": startdate,
    "enddate":enddate,
    "status": status,
    "description":description,
    "co_name1": co_name1,
    "co_name2":co_name2,
    "co_mobile1": co_mobile1,
    "co_mobile2":co_mobile2
}}).then((result) => {
      res.redirect("/admin/events");
    })
   
};

exports.getProducts = (req, res, next) => {
    Product.find()
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then((products) => {
            console.log(products);
            res.render("admin/events", {
                prods: products,
                pageTitle: "Admin Products",
                path: "/admin/events",
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return next(new Error("Product not found."));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(() => {
            console.log("DESTROYED PRODUCT");
            res.status(200).json({ message: "Success!" });
        })
        .catch((err) => {
            res.status(500).json({ message: "Deleting product failed." });
        });
};