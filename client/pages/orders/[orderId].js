import React, { useEffect, useState } from "react";
import Router from "next/router";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/useRequest";

const OrderDisplay = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const { fetch, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(() => {
    function findTimeRemaining() {
      const secondsLeft = (new Date(order.expiresAt) - new Date()) / 1000;
      setTimeLeft(Math.round(secondsLeft));
    }

    findTimeRemaining();
    const timerId = setInterval(findTimeRemaining, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <p>Order Expired</p>;
  }

  return (
    <div>
      <p>{timeLeft} seconds until order expires</p>
      <StripeCheckout
        token={({ id }) => fetch({ token: id })}
        stripeKey="pk_test_4033238REgJIbRLrndY1LxTn"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderDisplay.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderDisplay;
