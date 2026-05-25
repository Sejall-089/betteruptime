import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
