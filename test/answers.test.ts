import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

describe("Test Answers CRUD", () => {
  let res: Response;
  const request = baseRequest(server);

  // Log users in
  const login = async (username: string) => {
    res = await request
      .post("/accounts/login")
      .send({ username, password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    return res.body.token;
  };

  afterAll(async () => {
    // Close connections
    server.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // user 1
    const user = await prisma.user.create({
      data: {
        username: "user1",
        password: await bcrypt.hash("password123", 12),
        email: "u@gmail.com",
      },
    });

    // user 2
    await prisma.user.create({
      data: {
        username: "user2",
        password: await bcrypt.hash("password123", 12),
        email: "u2@gmail.com",
      },
    });

    // admin 1
    const admin = await prisma.user.create({
      data: {
        username: "admin1",
        password: await bcrypt.hash("password123", 12),
        email: "a@gmail.com",
        role: "ADMIN",
      },
    });

    // question 1
    const question = await prisma.question.create({
      data: {
        userId: user.id,
        body: "question1",
      },
    });

    // answer 1
    await prisma.answer.create({
      data: {
        userId: user.id,
        questionId: question.id,
        body: "answer1",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "User" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Answer" CASCADE;');
  });

  test("Test Answers LIST.", async () => {
    const count = await prisma.answer.count();

    const token = await login("user1");
    // * LIST (Auth: user)
    res = await request.get("/answers").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("results");
    expect(await prisma.answer.count()).toBe(count);

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        username: "user1",
      },
    });

    // Find question
    const question = await prisma.question.findFirst({
      where: {
        body: "question1",
      },
    });

    // create an answer
    await prisma.answer.create({
      data: {
        userId: user.id,
        questionId: question.id,
        body: "answer2",
      },
    });

    // * LIST (Auth: non)
    res = await request.get("/answers");

    expect(res.status).toBe(200);
    expect(await prisma.answer.count()).toBe(count + 1);

    // * Query by id
    const answer = await prisma.answer.findFirst({
      where: { body: "answer2" },
    });

    res = await request.get(`/answers?id=${answer.id}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.results[0]).toHaveProperty("body");
    expect(res.body.results[0]).toHaveProperty("questionId");
    expect(res.body.results[0]).toHaveProperty("userId");
  });

  test("Test Answer CREATE.", async () => {
    const count = await prisma.answer.count();

    // find user
    const user = await prisma.user.findUnique({
      where: {
        username: "user1",
      },
    });

    // Find question
    const question = await prisma.question.findFirst({
      where: {
        body: "question1",
      },
    });

    const token = await login("user1");

    // * Create (Auth: user)
    res = await request
      .post("/answers")
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: question.id, body: "answer2" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("questionId");
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("body");
    expect(await prisma.answer.count()).toBe(count + 1);

    // * Create (Auth: non)
    res = await request
      .post("/answers")
      .send({ questionId: question.id, body: "answer3" });
    expect(res.status).toBe(401);

    // * Try sending a user id with the request
    res = await request
      .post("/answers")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: user.id, questionId: question.id, body: "answer3" });

    expect(res.status).toBe(400);
    expect(await prisma.answer.count()).toBe(count + 1);
  });

  test("Test Answer UPDATE.", async () => {
    const token = await login("user1");

    // Find
    const answer = await prisma.answer.findFirst({
      where: { body: "answer1" },
    });

    // * Update (Auth: owner)
    res = await request
      .patch(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "updated" });

    expect(res.status).toBe(200);

    // checking
    const updated = await prisma.answer.findFirst();
    expect(updated.body).toEqual("updated");

    // * Update (Auth: user)
    const token2 = await login("user2");

    res = await request
      .patch(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ body: "updated?" });

    expect(res.status).toBe(403);

    // * Update (Auth: admin)
    const token3 = await login("admin1");

    res = await request
      .patch(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token3}`)
      .send({ body: "updated??" });

    expect(res.status).toBe(200);
    expect(res.body.body).toEqual("updated??");

    // * update an answer that doesn't exist
    res = await request
      .patch(`/answers/${uuid()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Something" });
    // Validation for the id fails and throws 400 (uuid !== cuid)
    expect(res.status).toBe(400);

    // * update an answer's question id
    res = await request
      .patch(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: uuid(), body: "Something" });
    // Validation error
    expect(res.status).toBe(400);
  });

  test("Test Answer DESTROY.", async () => {
    const count = await prisma.answer.count();
    const token = await login("user1");

    const question = await prisma.question.findFirst({
      where: { body: "question1" },
    });

    // * Create an answer
    res = await request
      .post("/answers")
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: question.id, body: "answer2" });

    expect(res.status).toBe(201);
    expect(await prisma.answer.count()).toBe(count + 1);

    // * Delete (Auth: user)
    const token2 = await login("user2");

    // Find
    const answer = await prisma.answer.findFirst({
      where: { body: "answer2" },
    });

    // Delete
    res = await request
      .delete(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(await prisma.answer.count()).toBe(count + 1);

    // * Delete (Auth: owner)

    // Delete
    res = await request
      .delete(`/answers/${answer.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await prisma.answer.count()).toBe(count);

    // * Delete an answer that doesn't exists
    res = await request
      .delete(`/answers/${uuid()}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(await prisma.answer.count()).toBe(count);

    // * Delete (Auth: admin)
    const token3 = await login("admin1");

    // Find
    const ans = await prisma.answer.findFirst({
      where: { body: "answer1" },
    });

    // Delete
    res = await request
      .delete(`/answers/${ans.id}`)
      .set("Authorization", `Bearer ${token3}`);

    expect(res.status).toBe(204);
    expect(await prisma.answer.count()).toBe(count - 1);
  });
});
