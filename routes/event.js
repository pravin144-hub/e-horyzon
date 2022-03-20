const path = require("path");

const express = require("express");

const eventController = require("../controllers/event");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", eventController.getHome);

router.get("/admin-panel", eventController.getAdminPanel);

router.get("/profile", eventController.getProfile);

router.get("/register", eventController.getRegister);

router.post("/register", eventController.postRegister);

router.get("/events", eventController.getProducts);

router.get("/events/:productId", eventController.getProduct);

router.get("/upcoming-events/:productId", eventController.getProduct1);

router.get("/upcoming-events", isAuth, eventController.getCart);

router.post("/upcoming-events", isAuth, eventController.postCart);

router.post("/upcoming-events-delete-item", isAuth, eventController.postCartDeleteProduct);

router.get("/checkout", isAuth, eventController.getCheckout);

router.get("/checkout/success", eventController.getCheckoutSuccess);

router.get("/checkout/cancel", eventController.getCheckout);

router.get("/orders", isAuth, eventController.getOrders);

router.get("/orders/:orderId", isAuth, eventController.getInvoice);

router.get("/event-registration", isAuth, eventController.geteventRegistration);

router.post("/event-registration", isAuth, eventController.posteventRegistration);

router.get("/delete-event",eventController.getDeleteEvent);

router.post("/delete-event",eventController.postDeleteEvent);

module.exports = router;