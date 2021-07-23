import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

describe("Test Question Votes CRUD", () => {
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
    const user2 = await prisma.user.create({
      data: {
        username: "user2",
        password: await bcrypt.hash("password123", 12),
        email: "u2@gmail.com",
      },
    });

    // question 1
    const question = await prisma.question.create({
      data: {
        userId: user.id,
        title: "newQ",
        body: "question1",
      },
    });

    // Vote 1
    await prisma.questionVote.create({
      data: {
        userId: user.id,
        questionId: question.id,
        type: "UPVOTE",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "User" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "QuestionVote" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
  });

  test("Test Vote CREATE.", async () => {
    const token = await login("user2");

    const question = await prisma.question.findFirst();

    // * Create (Auth: user)
    res = await request
      .post("/question/votes")
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: question.id, type: "UPVOTE" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("questionId");
    expect(res.body.type).toEqual("UPVOTE");

    // * Try to vote on the same question
    res = await request
      .post("/question/votes")
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: question.id, type: "UPVOTE" });

    expect(res.status).toBe(400);

    // * Create (Auth: non)
    res = await request
      .post("/question/votes")
      .send({ questionId: question.id, type: "UPVOTE" });
    expect(res.status).toBe(401);
  });

  test("Test Vote UPDATE.", async () => {
    const token = await login("user1");

    // Find question
    const question = await prisma.question.findFirst();

    // Find the vote
    const vote = await prisma.questionVote.findFirst({
      where: { questionId: question.id },
    });

    // * Update (Auth: owner)
    res = await request
      .patch(`/question/votes/${vote.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "DOWNVOTE" });

    expect(res.status).toBe(200);

    // checking
    const updated = await prisma.questionVote.findFirst();
    expect(updated.type).toEqual("DOWNVOTE");

    // * Try to update the question id
    res = await request
      .patch(`/question/votes/${vote.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ questionId: question.id, type: "DOWNVOTE" });

    expect(res.status).toBe(400);

    // * Update (Auth: user)
    const token2 = await login("user2");

    res = await request
      .patch(`/question/votes/${vote.id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ type: "UPVOTE" });

    expect(res.status).toBe(403);

    // * update a Vote that doesn't exist
    res = await request
      .patch(`/question/votes/${uuid()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "UPVOTE" });

    expect(res.status).toBe(404);
  });

  test("Test Vote DESTROY.", async () => {
    const token = await login("user1");
    const question = await prisma.question.findFirst();

    // * Delete (Auth: user)
    const token2 = await login("user2");

    // Find
    const vote = await prisma.questionVote.findFirst({
      where: { questionId: question.id },
    });

    // Delete
    res = await request
      .delete(`/question/votes/${vote.id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);

    // * Delete (Auth: owner)

    // Delete
    res = await request
      .delete(`/question/votes/${vote.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await prisma.questionVote.count()).toBe(0);

    // * Delete a vote that doesn't exists
    res = await request
      .delete(`/question/votes/${uuid()}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
