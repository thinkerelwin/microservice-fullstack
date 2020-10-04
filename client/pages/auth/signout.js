import React, { useEffect } from "react";
import Router from "next/router";
import { UseRequest } from "../../hooks/useRequest";

function Signout(props) {
  const { fetch, error } = UseRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    fetch();
  }, []);
  return <div>You are signing out...</div>;
}

export default Signout;
