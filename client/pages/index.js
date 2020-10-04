import axios from "axios";

import buildClient from "../api/build-client";

function HomePage({ currentUser }) {
  return currentUser ? <h1>You're signed in</h1> : <h1>Haven't signed in</h1>;
}

HomePage.getInitialProps = async ({ req }) => {
  const { data } = await buildClient({ req }).get("/api/users/currentuser");
  console.log("homepage", data);
  return data;
};

export default HomePage;
