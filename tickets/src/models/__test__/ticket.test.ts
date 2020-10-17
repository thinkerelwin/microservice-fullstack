import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  // preparations, create the ticket, save it to the database
  const ticket = Ticket.build({
    title: "festival",
    price: 13,
    userId: "1234",
  });

  await ticket.save();
  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  // make two seperate changes to the tickets we fetched
  firstInstance!.set({ price: 9 });
  secondInstance!.set({ price: 7 });
  // save the first fetched ticket
  await firstInstance!.save();
  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error("should't reach here, because error is catched");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "festival",
    price: 10,
    userId: "234",
  });

  await ticket.save();
  expect(ticket.version).toBe(0);
  await ticket.save();
  expect(ticket.version).toBe(1);
  await ticket.save();
  expect(ticket.version).toBe(2);
});
