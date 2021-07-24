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

  test("Test Field CREATE.", async () => {
    const count = await prisma.field.count();

    // * Create (Auth: non)

    res = await request.post("/fields").send({ name: "Field2" });
    expect(res.status).toBe(401);

    // * Create (Auth: User)
    const token = await login("user1");

    res = await request
      .post("/fields")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Field1" });

    expect(res.status).toBe(404);
    expect(await prisma.field.count()).toBe(count);

    // * Create (Auth: Admin)
    const adminToken = await login("admin1");

    res = await request
      .post("/fields")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Field1" });

    expect(res.status).toBe(404);
    expect(await prisma.field.count()).toBe(count);

    // * Create (Auth: Superadmin)
    const superToken = await login("super");

    res = await request
      .post("/fields")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "Field1" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("id");
    expect(await prisma.field.count()).toBe(count + 1);
  });

  test("Test Field Update.", async () => {
    const field = await prisma.field.findFirst();

    //* Update (Auth: Non)

    res = await request.patch(`/fields/${field.id}`).send({ name: "updated?" });
    expect(res.status).toBe(401);

    //* Update (Auth: User)
    const token = await login("user1");

    res = await request
      .patch(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "updated?" });
    expect(res.status).toBe(404);

    //* Update (Auth: Admin)
    const adminToken = await login("admin1");

    res = await request
      .patch(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "updated?" });
    expect(res.status).toBe(404);

    //* Update (Auth: Superadmin)
    const superToken = await login("super");

    res = await request
      .patch(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "updated?" });
    expect(res.status).toBe(200);
    expect(res.body.name).toEqual("updated?");

    //* Try to update a field that doesn't exist

    res = await request
      .patch(`/fields/${uuid()}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "updated?" });
    // (Id validation error)
    expect(res.status).toBe(400);

    //* Try to update the field id

    res = await request
      .patch(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "updated?", id: "gj21223131" });
    expect(res.status).toBe(400);
  });
});
