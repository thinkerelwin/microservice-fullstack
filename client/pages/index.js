import React from "react";
import Link from "next/link";
function HomePage({ currentUser, tickets = [] }) {
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.price}</td>
              <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                  <a>View</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

HomePage.getInitialProps = async ({ req }, client, currentUser) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default HomePage;
