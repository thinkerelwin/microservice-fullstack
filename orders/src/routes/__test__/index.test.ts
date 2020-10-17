import request from "supertest";
import mongoose from 'mongoose'

import { app } from "../../app";
import { RelatedTicket } from "../../models/relatedTicket";
import { mockSignIn } from "../../test/setup";

async function buildTicket() {
  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "festival",
    price: 15,
  });

  await ticket.save();

  return ticket;
}

it("fetches order from an specific user", async () => {
  // Create three tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const user1 = mockSignIn();
  const user2 = mockSignIn();

  // Create one order as User #1
  const response1 = await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({
      ticketId: ticket1.id,
    });

  expect(response1.status).toBe(201);
  // Create two orders as User #2
  const response2 = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({
      ticketId: ticket2.id,
    });

  expect(response1.status).toBe(201);

  const response3 = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({
      ticketId: ticket3.id,
    });

  expect(response1.status).toBe(201);
  // Make request to get orders for user #2
  const responseForUser2 = await request(app)
    .get("/api/orders")
    .set("Cookie", user2);

  expect(responseForUser2.status).toBe(200);
  // assert that we only get two orders for User #2
  expect(responseForUser2.body.length).toBe(2);
  expect(responseForUser2.body[0].id).toBe(response2.body.id);
  expect(responseForUser2.body[1].id).toBe(response3.body.id);
  expect(responseForUser2.body[0].ticket.id).toBe(ticket2.id);
  expect(responseForUser2.body[1].ticket.id).toBe(ticket3.id);
});
