import request from "supertest";
import mongoose from 'mongoose'

import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import { RelatedTicket } from "../../models/relatedTicket";
import { Order } from "../../models/order";
import { OrderStatus } from "@microservice-auth/common";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as cancelled", async () => {
  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const user = mockSignIn();

  const createOrderResponse = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    });

  expect(createOrderResponse.status).toBe(201);

  const cancelledOrderResponse = await request(app)
    .delete(`/api/orders/${createOrderResponse.body.id}`)
    .set("Cookie", user)
    .send();

  expect(cancelledOrderResponse.status).toBe(204);

  const updatedOrder = await Order.findById(createOrderResponse.body.id);

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
});

it("emit a order cancelled event", async () => {
  const ticket = RelatedTicket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "festival",
    price: 15,
  });

  await ticket.save();

  const user = mockSignIn();

  const createOrderResponse = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    });

  expect(createOrderResponse.status).toBe(201);

  const cancelledOrderResponse = await request(app)
    .delete(`/api/orders/${createOrderResponse.body.id}`)
    .set("Cookie", user)
    .send();

  expect(cancelledOrderResponse.status).toBe(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
