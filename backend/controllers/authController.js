const router = require("express").Router();
const mongoose = require("mongoose");

const checkRole = (roles) => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized!")
    : next();

module.exports = {
  checkRole,
};
