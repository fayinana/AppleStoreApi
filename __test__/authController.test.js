import { login } from "../controller/authController";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
  verify: jest.fn(),
}));

jest.mock("./../model/userModel.js", () => ({
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({
      email: "user@email.com",
      correctPassword: jest.fn().mockResolvedValue(true),
    }),
  }),
}));

const mockReq = {
  body: {
    email: "ananiyafekede@gmail.com",
    password: "12345678",
  },
};

const mockRes = {
  sendStatus: jest.fn(),
  send: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  cookie: jest.fn(),
};

const mockNext = jest.fn();

describe("User Authentication", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should log in successfully with correct credentials", async () => {
    await login(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "success",
      token: "mocked_token",
      user: {
        email: "user@email.com",
        correctPassword: expect.any(Function),
      },
    });
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "jwt",
      "mocked_token",
      expect.any(Object)
    );
  });

  it("should fail with invalid credentials", async () => {
    jest.mock("./../model/userModel.js", () => ({
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          email: "user@email.com",
          correctPassword: jest.fn().mockResolvedValue(false),
        }),
      }),
    }));

    await login(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid credentials",
    });
  });
});
