const request = require("supertest");
const express = require("express");
const app = express();
const notificationRoutes = require("../../routes/notification");

// Mock controllers
jest.mock("../../controllers/authController.js", () => ({
  checkRole: jest.fn().mockImplementation((roles) => (req, res, next) => {
    // Mock implementation of checkRole middleware
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  }),
}));

jest.mock("../../controllers/notificationController.js", () => ({
  createNotification: jest.fn(),
  getUserNotifications: jest.fn(),
  getAllNotices: jest.fn(),
  notificationAuth: jest.fn().mockImplementation((req, res, next) => {
    // Mock implementation of notificationAuth middleware
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }),
}));

// Mount the routes
app.use(express.json());
app.use("/", notificationRoutes);

describe("Notification routes", () => {
  test("POST / should call createNotification controller with proper authorization and role", async () => {
    const mockRequest = {
      body: {
        recipient: "testRecipient",
        faculty: "testFaculty",
        message: "Test message",
      },
    };

    // Simulate unauthorized request
    await request(app).post("/").send(mockRequest).expect(401); // Unauthorized since no authentication is mocked

    // Mock authentication
    app.use((req, res, next) => {
      req.user = { role: "admin" }; // Assuming the user is authenticated with admin role
      next();
    });

    // Send a POST request to `/` and expect 201 (Created)
    await request(app).post("/").send(mockRequest).expect(201);

    // Check if the controller function was called
    expect(notificationAuth).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith(mockRequest.body);
  });
});
