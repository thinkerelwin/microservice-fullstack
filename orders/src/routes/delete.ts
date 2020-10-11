import express, { Request, Response } from "express";
import {
  requireAuth,
  OrderStatus,
  NotFoundError,
  NotAuthorizedError,
} from "@microservice-auth/common";

import { Order } from "../models/order";
import { OrderCancelldPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelldPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    // since it's not actually delete the order, just changing the status,
    // it should use more appropriate method like "PATCH"
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
