const { signup, login } = require("../../controllers/userController");
const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("studTest"),
}));

jest.mock("../../models/userModel");

//signup()
describe("signup function", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status 400 if email is already registered", async () => {
    User.findOne.mockResolvedValueOnce(true); // Mocking email already exists

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud01",
    };

    await signup(userDetails, "student", res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email is already registered.",
    });
  });

  // test("should save user and return status 200 with user details", async () => {
  //   User.findOne.mockResolvedValueOnce(false); // Mocking email does not exist

  //   const userDetails = {
  //     email: "studTest.reg@gmail.com",
  //     password: "studTest",
  //   };

  //   await signup(userDetails, "student", res);

  //   expect(bcrypt.hash).toHaveBeenCalledWith("studTest", 12);
  //   expect(User).toHaveBeenCalledWith({
  //     ...userDetails,
  //     password: "studTest",
  //     role: "student",
  //   });
  //   expect(User.prototype.save).toHaveBeenCalled();
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "User added successfully.",
  //     user: expect.any(Object), // Assuming user object is returned
  //   });
  // });

  test("should return status 500 if an error occurs", async () => {
    User.findOne.mockRejectedValueOnce(new Error("Some error occurred"));

    const userDetails = {
      email: "studTest@gmail.com",
      password: "studTest",
    };

    await signup(userDetails, "student", res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Some error occurred" });
  });
});

//login
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("token"),
}));

describe("login function", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return status 404 if user does not exist", async () => {
    User.findOne.mockResolvedValueOnce(null); // Mocking user not found

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud01",
    };

    await login(userDetails, "student", res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found, Invalid login credentials.",
    });
  });

  test("should return status 403 if role does not match", async () => {
    User.findOne.mockResolvedValueOnce({ role: "admin" }); // Mocking user found with different role

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud01",
    };

    await login(userDetails, "student", res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid role, login with the correct portal.",
    });
  });

  test("should return status 403 if password is invalid", async () => {
    User.findOne.mockResolvedValueOnce({
      role: "student",
      password: "stud011",
    }); // Mocking user found with correct role

    bcrypt.compare.mockResolvedValueOnce(false); // Mocking invalid password

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud011",
    };

    await login(userDetails, "student", res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid password.",
      success: false,
    });
  });

  test("should return status 200 with token if login is successful", async () => {
    User.findOne.mockResolvedValueOnce({
      _id: "some-user-id", // Mocking the _id property
      role: "student",
      password: "stud01",
      email: "stud01@gmail.com",
    });

    bcrypt.compare.mockResolvedValueOnce(true);

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud01",
    };

    await login(userDetails, "student", res);

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        user_id: User._id, // Using the mock _id value
        email: userDetails.email,
        role: "student",
      },
      expect.any(String),
      { expiresIn: "3h" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully logged in.",
      email: userDetails.email,
      role: "student",
      token: "Bearer token",
      expiresIn: 3,
    });
  });

  test("should return status 404 if an error occurs", async () => {
    User.findOne.mockRejectedValueOnce(new Error("Some error occurred"));

    const userDetails = {
      email: "stud01@gmail.com",
      password: "stud01",
    };

    await login(userDetails, "role", res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Some error occurred" });
  });
});
