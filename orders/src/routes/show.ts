import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { body } from "express-validator";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@microservice-auth/common";

import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  [
    body("orderId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("OrderId must be provided"),
  ],
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
