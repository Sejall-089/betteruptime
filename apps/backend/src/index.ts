import express from "express";
import prisma from "@repo/db";
import { connectRedis, pushWebsiteCheck } from "@repo/redis-streams";
import {
  SignUpSchema,
  SignInSchema,
  WebsiteSchema,
  WebsiteTickSchema,
} from "@repo/common";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "./config.js";
import { authMiddleware } from "./authMiddleware.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedBody = SignUpSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ message: "Incorrect data" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsedBody.data.name,
        email: parsedBody.data.email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const parsedBody = SignInSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ message: "Incorrect data" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      parsedBody.data.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/create-website", authMiddleware, async (req, res) => {
  const parsedBody = WebsiteSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ message: "Incorrect data" });
    return;
  }

  try {
    const userId = req.userId;

    const existingWebsite = await prisma.website.findFirst({
      where: { userId, url: parsedBody.data.url },
    });

    if (existingWebsite) {
      res.status(400).json({ message: "Website already exists" });
      return;
    }

    const website = await prisma.website.create({
      data: {
        name: parsedBody.data.name,
        url: parsedBody.data.url,
        userId,
      },
    });

    try {
      await connectRedis();
      await pushWebsiteCheck({
        id: String(website.id),
        name: website.name,
        url: website.url,
      });
    } catch (error) {
      console.error("Failed to enqueue website check:", error);
    }

    return res.status(200).json({ message: "Website created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/websites", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const websites = await prisma.website.findMany({
      where: { userId },
      include: {
        ticks: {
          orderBy: [
            {
              checkedAt: "desc",
            },
          ],
          take: 1,
        },
      },
    });

    return res.status(200).json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/websites/:websiteId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const websiteId = req.params.websiteId;

  try {
    const website = await prisma.website.findUnique({
      where: { userId, id: Number(websiteId) },
      include: {
        ticks: {
          orderBy: [
            {
              checkedAt: "desc",
            },
          ],
          take: 1,
        },
      },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found" });
      return;
    }

    return res.status(200).json(website);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
