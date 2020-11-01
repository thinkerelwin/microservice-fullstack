import React from "react";

import { useRequest } from "../../hooks/useRequest";

const Ticket = ({ ticket }) => {
  const { fetch, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => console.log(order),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      <button onClick={fetch} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

Ticket.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default Ticket;
