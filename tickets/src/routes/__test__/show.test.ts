import request from "supertest";
import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import mongoose from "mongoose";

it("returns 404 if the ticket is not exist", async () => {
  const validId = mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`/api/tickets/${validId}`).send();

  expect(response.status).toEqual(404);
});

it("returns the ticket if it's found", async () => {
  const title = "concert";
  const price = 33;
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title,
      price,
    });

  expect(response.status).toEqual(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
