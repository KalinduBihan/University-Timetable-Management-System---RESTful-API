const {
  createNotification,
  getAllNotices,
} = require("../../controllers/notificationController");
const Notification = require("../../models/notificationModel");

jest.mock("../../models/notificationModel");

describe("createNotification function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        recipient: "student123",
        faculty: "Computer Science",
        message: "Important notice for all students.",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create a notification when all fields are provided", async () => {
    Notification.create.mockResolvedValueOnce({
      _id: "notification123",
      recipient: "student123",
      faculty: "Computer Science",
      message: "Important notice for all students.",
    });

    await createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        _id: "notification123",
        recipient: "student123",
        faculty: "Computer Science",
        message: "Important notice for all students.",
      },
    });
  }, 15000); // Set timeout to 15 seconds (15000 milliseconds)

  test("should return an error if recipient field is empty", async () => {
    req.body.recipient = ""; // Simulating empty recipient field

    await createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fill the recipient field.",
    });
  });

  test("should return an error if faculty field is missing", async () => {
    req.body.faculty = undefined; // Simulating missing faculty field

    await createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fill the faculty field.",
    });
  });

  test("should return an error if message field is missing", async () => {
    req.body.message = ""; // Simulating missing message field

    await createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fill the message field.",
    });
  });
});
