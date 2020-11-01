import React, { useState } from "react";
import Router from "next/router";

import { useRequest } from "../../hooks/useRequest";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { fetch, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  });

  function checkPriceValue() {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  }

  function onSubmit(event) {
    event.preventDefault();

    fetch();
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onBlur={checkPriceValue}
            type="text"
            className="form-control"
          />
        </div>
        {errors}
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
