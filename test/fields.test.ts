import baseRequest, { Response } from "supertest";
import server, { prisma } from "../src/server";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

describe("Test Fields CRUD", () => {
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

    // superadmin
    const superAdmin = await prisma.user.create({
      data: {
        username: "super",
        password: await bcrypt.hash("password123", 12),
        email: "super@gmail.com",
        role: "SUPERADMIN",
      },
    });

    // field 1
    const field = await prisma.field.create({
      data: {
        name: "new field",
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw('TRUNCATE "Field" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "User" CASCADE;');
    await prisma.$executeRaw('TRUNCATE "Question" CASCADE;');
  });

  test("Test Fields LIST.", async () => {
    const count = await prisma.field.count();

    // * LIST (Auth: user)
    const token = await login("user1");

    res = await request.get("/fields").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("results");
    expect(res.body.results[0]).not.toHaveProperty("deactivaterId");
    expect(res.body.count).toBe(count);

    // * LIST (Auth: non)
    res = await request.get("/fields");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("results");
    expect(res.body.results[0]).not.toHaveProperty("deactivaterId");

    // * Query by id
    const field = await prisma.field.findFirst();

    res = await request.get(`/fields?id=${field.id}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);

    // * LIST (Auth: Superadmin)
    const superToken = await login("super");
    res = await request
      .get("/fields")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("results");
    expect(res.body.results[0]).toHaveProperty("deactivaterId");
    expect(res.body.results[0]).toHaveProperty("activatorId");
    expect(res.body.results[0]).toHaveProperty("reason");
  });
});
