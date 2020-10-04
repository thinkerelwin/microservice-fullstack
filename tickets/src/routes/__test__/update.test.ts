import request from "supertest";
import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import mongoose from "mongoose";

it("returns a 404 if the provider id doesn't exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", mockSignIn())
    .send({
      title: "gibberish",
      price: 15,
    });

  expect(response.status).toEqual(404);
});

it("returns a 401 if the user is not autheticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).put(`/api/tickets/${id}`).send({
    title: "gibberish",
    price: 15,
  });

  expect(response.status).toEqual(401);
});

it("returns a 401 if the user doesn't own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title: "gibberish",
      price: 150,
    });

  const response2 = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", mockSignIn())
    .send({
      title: "Giberish",
      price: 150,
    });

  expect(response2.status).toBe(401);
});

it("returns a 400 if the user provides and invalid title or price", async () => {
  const cookie = mockSignIn();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "gibberish",
      price: 150,
    });

  const result1 = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 150,
    });

  expect(result1.status).toBe(400);

  const result2 = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "gibberish",
      price: -15,
    });

  expect(result2.status).toBe(400);
});

it("update the tickets if the inputs is valid, the user is already signin and does own the ticket", async () => {
  const cookie = mockSignIn();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "gibberish",
      price: 150,
    });

  const result = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "validTitle",
      price: 100,
    });

  expect(result.status).toBe(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("validTitle");
  expect(ticketResponse.body.price).toEqual(100);
});
