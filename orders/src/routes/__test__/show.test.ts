import request from "supertest";
import mongoose from 'mongoose';

import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import { RelatedTicket } from "../../models/relatedTicket";

it("returns an error if the user tring to fetch orders belong to others", async () => {
  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const user = mockSignIn();
  const user2 = mockSignIn();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    });

  expect(response.status).toBe(201);

  const fetchOrderResponse = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", user2)
    .send();

  expect(fetchOrderResponse.status).toBe(401);
});

it("fetches the order", async () => {
  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const user = mockSignIn();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    });

  expect(response.status).toBe(201);

  const fetchOrderResponse = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", user)
    .send();

  expect(fetchOrderResponse.status).toBe(200);
  expect(fetchOrderResponse.body.id).toBe(response.body.id);
});
