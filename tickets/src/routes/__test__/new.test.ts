import request from "supertest";
import { app } from "../../app";
import { mockSignIn } from "../../test/setup";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("return correct status if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error is an invalid title is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title: "",
      price: 10,
    });

  expect(response.status).toEqual(400);
});

it("returns an error is an invalid price is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title: "validTitle",
      price: -10,
    });

  expect(response.status).toEqual(400);
});

it("create a ticket with valid inputs", async () => {
  // add in a check to make sure a ticket was saved
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  const title = "passed";

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title,
      price: 15,
    });

  expect(response.status).toBe(201);

  tickets = await Ticket.find({});

  expect(tickets[0].price).toBe(15);
  expect(tickets[0].title).toBe(title);
});

it("publishes an event", async () => {
  const title = "passed";

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", mockSignIn())
    .send({
      title,
      price: 15,
    });

  expect(response.status).toBe(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
