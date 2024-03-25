const {
  createBooking,
  getBooking,
} = require("../../controllers/bookingController");
const Book = require("../../models/bookingModel");

jest.mock("../../models/bookingModel");

describe("createBooking function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        roomId: "room123",
        from: "10:00 AM",
        to: "12:00 PM",
        day: "2024-03-08",
        description: "Meeting",
      },
      params: {
        refId: "user123",
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

  test("should create a booking when all fields are provided", async () => {
    Book.find.mockResolvedValueOnce([]);
    Book.create.mockResolvedValueOnce({
      _id: "booking123",
      roomId: "room123",
      from: "10:00 AM",
      to: "12:00 PM",
      day: "2024-03-08",
      description: "Meeting",
      refId: "user123",
    });

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      booking: {
        _id: "booking123",
        roomId: "room123",
        from: "10:00 AM",
        to: "12:00 PM",
        day: "2024-03-08",
        description: "Meeting",
        refId: "user123",
      },
    });
  });

  test("should return a message if the room is already booked", async () => {
    Book.find.mockResolvedValueOnce([
      {
        roomId: "room123",
        from: "10:00 AM",
        to: "12:00 PM",
        day: "2024-03-08",
      },
    ]);

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "room123 is booked from 10:00 AM to 12:00 PM on 2024-03-08",
    });
  });

  test("should return an error if any field is missing", async () => {
    req.body.roomId = ""; // Simulating missing roomId

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please fill in missing feilds",
    });
  });
});
