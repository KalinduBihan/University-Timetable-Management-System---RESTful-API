const cors = require("cors");
const express = require("express");
const bp = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const { success, error } = require("consola");

const { MONGO_URI, PORT } = require("./config/index");

const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const enrollRoutes = require("./routes/enroll");
const bookingRoutes = require("./routes/booking");
const timeTableRoutes = require("./routes/timetable");
const notificationRoutes = require("./routes/notification");

//Innitialization
const app = express();

//Router middleware
app.use(express.json());
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

require("./middlewares/passport")(passport);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/timetable", timeTableRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB
const startApp = async () => {
  try {
    await mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        app.listen(PORT, () => {
          success({
            message: `Successfully connected to database and server running on ${PORT}`,
            badge: true,
          });
        });
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  } catch (err) {
    error({
      message: `Unable to connected with database \n${err}`,
      badge: true,
    });
  }
};

startApp();
