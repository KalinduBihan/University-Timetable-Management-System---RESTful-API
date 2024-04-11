const router = require("express").Router();
const {
  userAuth,
  signup,
  login,
  //   checkRole,
  serializeUser,
  getAllStudents,
} = require("../controllers/userController");
const { checkRole } = require("../controllers/authController");
const User = require("../models/userModel");

//user signUp
router.post("/signup", async (req, res) => {
  const { role } = req.body;

  if (role === "") {
    await signup(req.body, "student", res);
  } else if (role === "admin" || role === "faculty" || role === "student") {
    await signup(req.body, role, res);
  } else {
    res.status(400).json({ error: "Invalid role type" });
  }
});

//user login
router.post("/login", async (req, res) => {
  const { email } = req.body;

  //get the assigned role
  const user = await User.findOne({ email });

  await login(req.body, res);
  // await login(req.body, user.role, res);
});

//get user Profile
router.get("/profile", userAuth, async (req, res) => {
  return res.json(serializeUser(req.user));
});

router.get("/studentList", userAuth, checkRole(["admin"]), getAllStudents);

module.exports = router;
