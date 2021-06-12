import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import jwt from "jsonwebtoken";
import { secrets } from "../src/utils";
import bcrypt from "bcrypt";

describe("Test Questions CRUD", () => {
  let res: Response;
  const request = baseRequest(server);

  const login = async () => {
    await request
      .post("/accounts/login")
      .send({ username: "user1", password: "123456" });
    // console.log(res.body.token);
    return res.body.token;
  };

  afterAll(async () => {
    // Close connections
    server.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const user = request.post("/accounts/register").send({
      username: "user1",
      password: await bcrypt.hash("123456", 12),
      email: "m@gmail.com",
    });
    console.log((await user).body);
    const question1 = await prisma.question.create({
      data: {
        userId: "123",
        body: "firstquestion",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
  });

  test("Test Question LIST.", async () => {
    const token = await login();
    // * LIST
    res = await request
      .get("/questions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("body");
    expect(res.body).toHaveProperty("userId");

    // * Retrieve
    const firstquestion = await prisma.question.findFirst({
      where: { body: "firstquestion" },
    });
    res = await request.get("/questions").query({ id: firstquestion.id });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("body");
    expect(res.body).toHaveProperty("userId");
  });

  test("Test Question CREATE.", async () => {
    // * Create question
    res = await request
      .post("/questions")
      .send({ userId: "123", body: "question" });

    expect(res.status).toBe(201);
    expect(await prisma.question.count()).toBe(2);
  });

  test("Test Question UPDATE.", async () => {
    // * update Question
    const question = await prisma.question.findFirst({
      where: { body: "firstquestion" },
    });

    res = await request
      .patch(`/questions/${question.id}`)
      .send({ body: "anything" });

    expect(res.body.body).toEqual("anything");

    const updated = await prisma.question.findFirst();

    expect(updated.body).toEqual("anything");

    // * update a question that doesn't exist
    res = await request.patch(`/questions/${1232}`).send({ body: "Something" });
    expect(res.status).toBe(404);
  });

  test("Test Question DESTROY.", async () => {
    // * Create question
    res = await request
      .post("/questions")
      .send({ body: "something", userId: "1232" });

    expect(res.status).toBe(201);
    expect(await prisma.question.count()).toBe(2);

    const question = await prisma.question.findFirst({
      where: { body: "something" },
    });

    res = await request.delete(`/questions/${question.id}`);
    expect(res.status).toBe(204);
    expect(await prisma.question.count()).toBe(1);

    // * Delete a category that doesn't exists
    res = await request.delete(`/questions/${123}`);
    expect(res.status).toBe(404);
    expect(await prisma.question.count()).toBe(1);
  });
});
