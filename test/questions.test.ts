import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

describe("Test Questions CRUD", () => {
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
    await prisma.question.create({
      data: {
        userId: user.id,
        body: "first question",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "User" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
  });

  test("Test Question LIST.", async () => {
    const count = await prisma.question.count();
    const token = await login("user1");
    // * LIST (Auth: user)
    res = await request
      .get("/questions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("results");
    expect(await prisma.question.count()).toBe(count);

    const user = await prisma.user.findUnique({
      where: {
        username: "user1",
      },
    });

    // create a question
    await prisma.question.create({
      data: {
        userId: user.id,
        body: "newQ",
      },
    });

    // * LIST (Auth: non)
    res = await request.get("/questions");

    expect(res.status).toBe(200);
    expect(await prisma.question.count()).toBe(count + 1);

    // * Query by id
    const question = await prisma.question.findFirst({
      where: { body: "newQ" },
    });

    res = await request.get(`/questions?id=${question.id}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.results[0]).toHaveProperty("body");
    expect(res.body.results[0]).toHaveProperty("userId");
  });

  test("Test Question CREATE.", async () => {
    const count = await prisma.question.count();
    // *  find user
    const user = await prisma.user.findUnique({
      where: {
        username: "user1",
      },
    });

    const token = await login("user1");

    // * Create (Auth: user)
    res = await request
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "question2" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("body");
    expect(await prisma.question.count()).toBe(count + 1);

    // * Create (Auth: non)
    res = await request.post("/questions").send({ body: "question3" });
    expect(res.status).toBe(401);

    // * Try sending a user id with the request
    res = await request
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: user.id, body: "question3" });

    expect(res.status).toBe(400);
    expect(await prisma.question.count()).toBe(2);
  });

  test("Test Question UPDATE.", async () => {
    const token = await login("user1");

    // Find
    const question = await prisma.question.findFirst({
      where: { body: "first question" },
    });

    // * Update (Auth: owner)
    res = await request
      .patch(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "updated" });

    expect(res.status).toBe(200);

    // checking
    const updated = await prisma.question.findFirst();
    expect(updated.body).toEqual("updated");

    // * Update (Auth: user)
    const token2 = await login("user2");

    res = await request
      .patch(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ body: "updated?" });

    expect(res.status).toBe(403);

    // * Update (Auth: admin)
    const token3 = await login("admin1");

    res = await request
      .patch(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token3}`)
      .send({ body: "updated??" });

    expect(res.status).toBe(200);
    expect(res.body.body).toEqual("updated??");

    // * update a question that doesn't exist
    res = await request
      .patch(`/questions/${uuid()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Something" });
    expect(res.status).toBe(404);
  });

  test("Test Question DESTROY.", async () => {
    const count = await prisma.question.count();
    const token = await login("user1");

    // * Create question
    res = await request
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "question2" });

    expect(res.status).toBe(201);
    expect(await prisma.question.count()).toBe(count + 1);

    // * Delete (Auth: user)
    const token2 = await login("user2");

    // Find the question
    const question = await prisma.question.findFirst({
      where: { body: "question2" },
    });

    // Delete the question
    res = await request
      .delete(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(await prisma.question.count()).toBe(count + 1);

    // * Delete (Auth: owner)

    // Delete the question
    res = await request
      .delete(`/questions/${question.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await prisma.question.count()).toBe(count);

    // * Delete a question that doesn't exists
    res = await request
      .delete(`/questions/${uuid()}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(await prisma.question.count()).toBe(count);

    // * Delete (Auth: admin)
    const token3 = await login("admin1");

    // Find the question
    const q = await prisma.question.findFirst({
      where: { body: "first question" },
    });

    // Delete the question
    res = await request
      .delete(`/questions/${q.id}`)
      .set("Authorization", `Bearer ${token3}`);

    expect(res.status).toBe(204);
    expect(await prisma.question.count()).toBe(count - 1);
  });
});
