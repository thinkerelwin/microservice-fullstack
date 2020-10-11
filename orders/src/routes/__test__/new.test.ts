import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import { Order } from "../../models/order";
import { OrderStatus } from "@microservice-auth/common";
import { RelatedTicket } from "../../models/relatedTicket";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket doesn't exist", async () => {
  const ticketId = mongoose.Types.ObjectId();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", mockSignIn())
    .send({
      ticketId,
    });

  expect(response.status).toBe(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = RelatedTicket.build({
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    userId: "randomId",
    ticket,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", mockSignIn())
    .send({
      ticketId: ticket.id,
    });

  expect(response.status).toBe(400);
});

it("reserves a ticket if the ticket isn't reserved", async () => {
  const ticket = RelatedTicket.build({
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", mockSignIn())
    .send({
      ticketId: ticket.id,
    });

  expect(response.status).toBe(201);
});

it("emit an order created event", async () => {
  const ticket = RelatedTicket.build({
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", mockSignIn())
    .send({
      ticketId: ticket.id,
    });

  expect(response.status).toBe(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
