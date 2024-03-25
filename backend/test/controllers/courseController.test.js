const {
  createCourse,
  deleteCourse,
} = require("../../controllers/coureseController");
const Course = require("../../models/courseModel");
const mongoose = require("mongoose");

jest.mock("../../models/courseModel", () => ({
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

describe("createCourse function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "Course Name",
        courseCode: "CSCI101",
        description: "Course description",
        credits: 3,
        facultyId: "facultyId",
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
    delete incompleteReq.body.name;

    await createCourse(incompleteReq, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please fill in missing feilds",
    });
  });

  test("should save course and return status 200 with course details", async () => {
    const mockCourse = {
      _id: "courseId",
      name: "Course Name",
      courseCode: "CSCI101",
      description: "Course description",
      credits: 3,
      facultyId: "facultyId",
    };

    Course.create.mockResolvedValueOnce(mockCourse);

    await createCourse(req, res);

    expect(Course.create).toHaveBeenCalledWith({
      name: req.body.name,
      courseCode: req.body.courseCode,
      description: req.body.description,
      credits: req.body.credits,
      facultyId: req.body.facultyId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ course: mockCourse });
  });

  test("should return status 400 if an error occurs", async () => {
    const errorMessage = "Database error";

    Course.create.mockRejectedValueOnce(new Error(errorMessage));

    await createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("deleteCourse function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: "courseId",
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

  test("should return status 404 if the provided id is not valid", async () => {
    req.params.id = "invalidId";

    await deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No such course" });
  });

  test("should return status 404 if no course is found with the provided id", async () => {
    Course.findOneAndDelete.mockResolvedValueOnce(null);

    await deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No such course" });
  });

  test("should handle errors and return status 500", async () => {
    const errorMessage = "No such course";

    Course.findOneAndDelete.mockRejectedValueOnce(new Error(errorMessage));

    await deleteCourse(req, res);

    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  //   test("should delete the course and return status 200 with the deleted course", async () => {
  //     const mockCourseId = "courseId";
  //     const mockCourse = {
  //       _id: mockCourseId,
  //       name: "Course Name",
  //       courseCode: "CSCI101",
  //       description: "Course description",
  //       credits: 3,
  //       facultyId: "facultyId",
  //     };

  //     // Set up the req object with the expected params
  //     const req = {
  //       params: {
  //         id: mockCourseId,
  //       },
  //     };

  //     // Mocking findOneAndDelete to resolve with mockCourse when called with the provided ID
  //     Course.findOneAndDelete.mockResolvedValueOnce(mockCourse);

  //     // Call the deleteCourse function with the req and res objects
  //     await deleteCourse(req, res);

  //     // Check if findOneAndDelete is called with the correct ID
  //     expect(Course.findOneAndDelete).toHaveBeenCalledWith({
  //       _id: req.params.id,
  //     });

  //     // Check if the response status is set to 200
  //     expect(res.status).toHaveBeenCalledWith(200);

  //     // Check if the response JSON matches the mockCourse
  //     expect(res.json).toHaveBeenCalledWith(mockCourse);
  //   });
});
