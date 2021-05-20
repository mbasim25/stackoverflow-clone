import request from "supertest";
import app from "../src/app";

describe("Test / route", () => {
  test("Get request should returns 200 status code", async () => {
    await request(app).get("/").expect("Content-Type", /json/).expect(200);
  });
});
