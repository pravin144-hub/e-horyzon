const fs = require("fs");
const path = require("path");

const stripe = require("stripe")(
    "stripe_key"
);
const PDFDocument = require("pdfkit");
const Participant = require("../models/participant");
const Winner = require("../models/winner");
const Event = require("../models/event");
const User = require("../models/user");
const Product = require("../models/event");

const Register = require("../models/register");

const ITEMS_PER_PAGE = 6;


exports.getHome = (req, res, next) => {
    res.render("event/home", {
        pageTitle: "Boat - LifeStyle",
        path: "/",
        
    });
};

exports.getAdminPanel = (req, res, next) => {
    res.render("event/admin-panel", {
        pageTitle: "Boat - LifeStyle",
        path: "/admin-panel",
      
    });
};

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            
            res.render("event/event-list", {
                status:products.status,
                prods: products,
                pageTitle: "Products",
                path: "/events",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
            
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render("event/event-detail", {
                product: product,
                pageTitle: product.title,
                path: "/events",
            });
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getProduct1 = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render("event/upcoming-event-detail", {
                product: product,
                pageTitle: product.title,
                path: "/upcoming-events",
            });
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("event/index", {
                prods: products,
                pageTitle: "Shop",
                path: "/",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getCart = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            
            res.render("event/upcoming-events", {
                status:products.status,
                prods: products,
                pageTitle: "Products",
                path: "/upcoming-events",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
            
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.postCart = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((products) => {
            
            res.render("event/upcoming-events", {
                status:products.status,
                prods: products,
                pageTitle: "Products",
                path: "/upcoming-events",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
            
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then((result) => {
            res.redirect("/upcoming-events");
        })
        .catch((err) => {
            console.log("**", err);
        });
};
exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;
    req.user
        .populate("cart.items.productId")
        // .execPopulate()
        .then((user) => {
            products = user.cart.items;
            total = 0;
            products.forEach((p) => {
                total += p.quantity * p.productId.price;
            });

            return stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: products.map((p) => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: "inr",
                        quantity: p.quantity,
                    };
                }),
                success_url: req.protocol + "://" + req.get("host") + "/checkout/success", // => http://localhost:3000
                cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
            });
        })
        .then((session) => {
            res.render("event/checkout", {
                path: "/checkout",
                pageTitle: "Checkout",
                products: products,
                totalSum: total,
                sessionId: session.id,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        // .execPopulate()
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: {...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
                products: products,
            });
            return order.save();
        })
        .then((result) => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        // .execPopulate()
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: {...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
                products: products,
            });
            return order.save();
        })
        .then((result) => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then((orders) => {
            res.render("event/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                orders: orders,
            });
        })
        .catch((err) => {
            console.log("**", err);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then((order) => {
            if (!order) {
                return next(new Error("No order found."));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error("Unauthorized"));
            }
            const invoiceName = "Receipt -" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text("Amount Paid Successfully !!", {
                underline: true,
            });
            pdfDoc.text("-----------------------");
            let totalPrice = 0;
            order.products.forEach((prod) => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc
                    .fontSize(14)
                    .text(
                        prod.product.title +
                        " - " +
                        prod.quantity +
                        " x " +
                        prod.product.price +
                        " Rs"
                    );
            });
            pdfDoc.text("---");
            pdfDoc.fontSize(20).text("Total Price: " + totalPrice + " Rs");

            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //   if (err) {
            //     return next(err);
            //   }
            //   res.setHeader('Content-Type', 'application/pdf');
            //   res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceName + '"'
            //   );
            //   res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);

            // file.pipe(res);
        })
        .catch((err) => next(err));
};

exports.getRegister = (req, res, next) => {
 console.log("get")
};

exports.postRegister = (req, res, next) => {
    const eventname = req.body.eventname;
     console.log("event : " +req.body.eventname);
              res.render("event/register", {
                  path: "/register",
                  pageTitle: "Your Orders",
                  eventname: eventname
              });
          
  };

exports.getProfile = (req, res, next) => {
    const email = req.session.email;
    User.findOne({email: email}).then((user) => {
        Register.find({email: email}).then((event) => {
            Participant.find({email: email}).then((participant) => {
                Winner.find({email: email}).then((winner) => {
                    res.render("event/profile", {
                        user:user,
                        events:event,
                        participant:participant,
                        winner:winner,
                        path: "/profile",
                        pageTitle: "Your Profile",
                        
                    });
                })
            })
        })
    })
};

exports.geteventRegistration = (req, res, next) => {
 console.log("get event registration");
};

exports.posteventRegistration = (req, res, next) => {
   const eventname = req.body.eventname;
   const team1 = req.body.team1;
   const team2 = req.body.team2;

   if(team1 != 1 && team2 != 2)
   {
        const name1 = req.body.name1;
        const regno1 = req.body.regno1;
        const email1 = req.body.email1;
        const phone1 = req.body.phone1;
        const department1 = req.body.department1;
        const year1 = req.body.year1;
        const section1 = req.body.section1;

        const data1 = {
            eventname:eventname,
            name:name1,
            regno:regno1,
            email:email1,
            phone:phone1,
            department:department1,
            year:year1,
            section:section1
        }
        Register.create(data1).then((result) =>{
            res.redirect("/events");
        })
   }

   if(team1 == 1) 
   {
         const name1 = req.body.name1;
         const regno1 = req.body.regno1;
         const email1 = req.body.email1;
         const phone1 = req.body.phone1;
         const department1 = req.body.department1;
         const year1 = req.body.year1;
         const section1 = req.body.section1;

         const data1 = {
            eventname:eventname,
            name:name1,
            regno:regno1,
            email:email1,
            phone:phone1,
            department:department1,
            year:year1,
            section:section1
        }
       

         const name4 = req.body.name4;
         const regno4 = req.body.regno4;
         const email4 = req.body.email4;
         const phone4 = req.body.phone4;
         const department4 = req.body.department4;
         const year4 = req.body.year4;
         const section4 = req.body.section4;

         const data4 = {
            eventname:eventname,
            name:name4,
            regno:regno4,
            email:email4,
            phone:phone4,
            department:department4,
            year:year4,
            section:section4
        }

         Register.create(data1).then((result) =>{
            Register.create(data4).then((result) =>{
                res.redirect("/events");
            })           
        })
    }
    
    if(team2 == 2)
    {
        const name1 = req.body.name1;
        const regno1 = req.body.regno1;
        const email1 = req.body.email1;
        const phone1 = req.body.phone1;
        const department1 = req.body.department1;
        const year1 = req.body.year1;
        const section1 = req.body.section1;

        const data1 = {
            eventname:eventname,
            name:name1,
            regno:regno1,
            email:email1,
            phone:phone1,
            department:department1,
            year:year1,
            section:section1
        }

        const name2 = req.body.name2;
        const regno2 = req.body.regno2;
        const email2 = req.body.email2;
        const phone2 = req.body.phone2;
        const department2 = req.body.department2;
        const year2 = req.body.year2;
        const section2 = req.body.section2;

        const data2 = {
            eventname:eventname,
            name:name2,
            regno:regno2,
            email:email2,
            phone:phone2,
            department:department2,
            year:year2,
            section:section2
        }

        const name3 = req.body.name3;
        const regno3 = req.body.regno3;
        const email3 = req.body.email3;
        const phone3 = req.body.phone3;
        const department3 = req.body.department3;
        const year3 = req.body.year3;
        const section3 = req.body.section3;

        const data3 = {
            eventname:eventname,
            name:name3,
            regno:regno3,
            email:email3,
            phone:phone3,
            department:department3,
            year:year3,
            section:section3
        }

        Register.create(data1).then((result) =>{
            Register.create(data2).then((result) =>{
                Register.create(data3).then((result) =>{
                    res.redirect("/events");
                })
            })           
        })
    }

};



exports.getDeleteEvent = (req, res, next) => {
    console.log("get event delete");
};
   
exports.postDeleteEvent = (req, res, next) => {
    const proid = req.body.productId;
    Event.findByIdAndDelete({_id: proid}).then((event) =>{
              res.redirect('/admin/events')
    })
};
