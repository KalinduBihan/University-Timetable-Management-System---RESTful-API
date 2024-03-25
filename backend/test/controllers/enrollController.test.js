const {
  enrollCourse,
  enrolledList,
} = require("../../controllers/enrollController");
const Course = require("../../models/courseModel");
const enrollModel = require("../../models/enrollModel");

jest.mock("../../models/courseModel", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../models/enrollModel", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

describe("enrollCourse function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        studentId: "studentId",
        courseName: "Course Name",
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

  test("should return status 404 if any field is missing", async () => {
    const incompleteReq = { ...req };
    delete incompleteReq.body.studentId;

    await enrollCourse(incompleteReq, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please fill in all feilds",
    });
  });

  test("should return status 200 with message if student is already enrolled", async () => {
    enrollModel.find.mockResolvedValueOnce([
      { studentId: "studentId", courseName: "Course Name" },
    ]);

    await enrollCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Already enrolled." });
  });

  test("should handle errors and return status 400 with error message", async () => {
    const errorMessage = "Database error";

    // Mocking the rejection of enrollModel.create with an error
    enrollModel.find.mockResolvedValueOnce([]);
    Course.find.mockResolvedValueOnce([{ name: "Course Name" }]);
    enrollModel.create.mockRejectedValueOnce(new Error(errorMessage));

    await enrollCourse(req, res);

    // Expectations for response status and JSON
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("enrolledList function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        courseName: "Course Name",
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

  test("should return enrolled students when students are enrolled", async () => {
    // Mocking the resolved value of enrollModel.find to simulate enrolled students
    enrollModel.find.mockResolvedValueOnce([
      { studentId: "student1", courseName: "Course Name" },
      { studentId: "student2", courseName: "Course Name" },
    ]);

    await enrolledList(req, res);

    // Expectations for response status and JSON
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(["student1", "student2"]);
  });

  test("should return 401 and message when no students are enrolled", async () => {
    // Mocking the resolved value of enrollModel.find to simulate no enrolled students
    enrollModel.find.mockResolvedValueOnce([]);

    await enrolledList(req, res);

    // Expectations for response status and JSON
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No enrolled students." });
  });
});
