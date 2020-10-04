import { useState } from "react";
import Router from "next/router";
import { UseRequest } from "../../hooks/useRequest";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { fetch, errors } = UseRequest({
    url: "/api/users/signup",
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/"),
  });

  async function onSubmit(event) {
    event.preventDefault();
    await fetch();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="">Email address</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="">Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
}

export default SignUp;
