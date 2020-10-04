import request from "supertest";
import { app } from "../../app";
import { mockSignIn } from "../../test/setup";

it("respounds with details about the current user", async () => {
  const cookie = await mockSignIn();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("response with null if not signed in", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
