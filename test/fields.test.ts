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
    // field 1
    const field = await prisma.field.create({
      data: {
        name: "new field",
      },
    });

    // user 1
    const user = await prisma.user.create({
      data: {
        username: "user1",
        password: await bcrypt.hash("password123", 12),
        email: "u@gmail.com",
        fieldId: field.id,
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

    await prisma.question.create({
      data: {
        userId: user.id,
        body: "q1",
        title: "q1",
        fieldId: field.id,
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

  test("Test Field Delete.", async () => {
    const count = await prisma.field.count();
    const field = await prisma.field.findFirst();

    //* Delete (Auth: Non)

    res = await request.delete(`/fields/${field.id}`);
    expect(res.status).toBe(401);

    //* Delete (Auth: User)
    const token = await login("user1");

    res = await request
      .delete(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);

    //* Delete (Auth: Admin)
    const adminToken = await login("admin1");

    res = await request
      .delete(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(await prisma.field.count()).toBe(count);

    //* Try to delete a field that doesn't exist
    const superToken = await login("super");

    res = await request
      .delete(`/fields/${uuid()}`)
      .set("Authorization", `Bearer ${superToken}`);
    // (Id validation error)
    expect(res.status).toBe(400);

    //* Delete (Auth: Superadmin)

    // connected user & question
    const user = await prisma.user.findFirst({ where: { username: "user1" } });
    const question = await prisma.question.findFirst();
    expect(question.fieldId).toEqual(field.id);
    expect(user.fieldId).toEqual(field.id);

    // Delete
    res = await request
      .delete(`/fields/${field.id}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(204);
    expect(await prisma.field.count()).toBe(count - 1);

    // Check the relations after delete
    const samequestion = await prisma.question.findFirst();
    const sameuser = await prisma.user.findFirst({
      where: { username: "user1" },
    });
    expect(samequestion.fieldId).toEqual(null);
    expect(sameuser.fieldId).toEqual(null);
  });

  test("Test Field Activate", async () => {
    const token = await login("user1");
    const field = await prisma.field.findFirst();

    // Activate (Auth: User)
    res = await request
      .post(`/fields/activate/${field.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "already checked and ready to be activated" });
    expect(res.status).toBe(404);

    // Activate (Auth: Admin)
    const adminToken = await login("admin1");
    const admin = await prisma.user.findFirst({
      where: { username: "admin1" },
    });

    res = await request
      .post(`/fields/activate/${field.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "already checked and ready to be activated" });
    expect(res.status).toBe(200);
    expect(res.body.deactivaterId).toEqual(null);
    expect(res.body.activatorId).toEqual(admin.id);

    // Activate (Auth: Superadmin)
    const superToken = await login("super");

    res = await request
      .post(`/fields/activate/${field.id}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ reason: "already checked and ready to be activated" });
    expect(res.status).toBe(200);
  });

  test("Test Field Deactivate", async () => {
    const token = await login("user1");
    const field = await prisma.field.findFirst();

    // Deactivate (Auth: User)
    res = await request
      .post(`/fields/deactivate/${field.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "this field is no longer relevant" });
    expect(res.status).toBe(404);

    // Deactivate (Auth: Admin)
    const adminToken = await login("admin1");
    const admin = await prisma.user.findFirst({
      where: { username: "admin1" },
    });

    res = await request
      .post(`/fields/deactivate/${field.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "this field is no longer relevant" });
    expect(res.status).toBe(200);
    expect(res.body.deactivaterId).toEqual(admin.id);
    expect(res.body.activatorId).toEqual(null);

    // Deactivate (Auth: Superadmin)
    const superToken = await login("super");

    res = await request
      .post(`/fields/deactivate/${field.id}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ reason: "this field name needs a spelling check" });
    expect(res.status).toBe(200);
  });
});
