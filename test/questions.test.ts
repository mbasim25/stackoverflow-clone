import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import jwt from "jsonwebtoken";
import { secrets } from "../src/utils";
import bcrypt from "bcrypt";
import users from "../src/controllers/users";

describe("Test Questions CRUD", () => {
  let res: Response;
  const request = baseRequest(server);

  const login = async () => {
    res = await request
      .post("/accounts/login")
      .send({ username: "m123456", password: "m123456" });
    return res.body.token;
  };

  afterAll(async () => {
    // Close connections
    server.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        username: "m123456",
        password: await bcrypt.hash("m123456", 12),
        email: "m@gmail.com",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "User" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
  });

  test("Test Question LIST.", async () => {
    const token = await login();
    // * LIST
    res = await request
      .get("/questions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({
      where: {
        username: "m123456",
      },
    });

    await prisma.question.create({
      data: {
        userId: user.id,
        body: "newQ",
      },
    });

    // * Retrieve
    const question = await prisma.question.findFirst({
      where: { body: "newQ" },
    });

    res = await request
      .get(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("question");
    expect(res.body).toHaveProperty("score");
    expect(res.body.question).toHaveProperty("body");
    expect(res.body.question).toHaveProperty("userId");
  });

  test("Test Question CREATE.", async () => {
    // *  find user
    const user = await prisma.user.findUnique({
      where: {
        username: "m123456",
      },
    });
    const token = await login();
    // * Create question
    res = await request
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: user.id, body: "question" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("body");

    expect(await prisma.question.count()).toBe(1);
  });

  test("Test Question UPDATE.", async () => {
    // *  find user
    const user = await prisma.user.findUnique({
      where: {
        username: "m123456",
      },
    });
    const token = await login();

    const newQ = await prisma.question.create({
      data: {
        userId: user.id,
        body: "newQ",
      },
    });

    // * find Question
    const question = await prisma.question.findFirst({
      where: { body: "newQ" },
    });

    // * update Question
    res = await request
      .patch(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "anything" });

    expect(res.status).toBe(200);

    // checking
    const updated = await prisma.question.findFirst();
    expect(updated.body).toEqual("anything");

    // * update a question that doesn't exist
    res = await request
      .patch(`/questions/${1232}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Something" });
    expect(res.status).toBe(404);
  });

  test("Test Question DESTROY.", async () => {
    // *  find user
    const user = await prisma.user.findUnique({
      where: {
        username: "m123456",
      },
    });
    const token = await login();

    // * Create question
    res = await request
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "something", userId: user.id });

    expect(res.status).toBe(201);
    expect(await prisma.question.count()).toBe(1);

    const question = await prisma.question.findFirst({
      where: { body: "something" },
    });

    res = await request
      .delete(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
    expect(await prisma.question.count()).toBe(0);

    // * Delete a question that doesn't exists
    res = await request
      .delete(`/questions/${123}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(await prisma.question.count()).toBe(0);
  });
});
