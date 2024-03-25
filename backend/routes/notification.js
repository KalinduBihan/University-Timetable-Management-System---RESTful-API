const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  getAllNotices,
  notificationAuth,
} = require("../controllers/notificationController");
const { checkRole } = require("../controllers/authController");

// Create a new notification
router.post("/", notificationAuth, checkRole(["admin"]), createNotification);

//get all notifications
router.get("/", getAllNotices);

// Get all notifications for a user
router.get("/:code/:faculty", getUserNotifications);

module.exports = router;
