import "bootstrap/dist/css/bootstrap.css";

import Header from "../components/Header";
import buildClient from "../api/build-client";

export default function CustomApp({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

CustomApp.getInitialProps = async ({ Component, ctx }) => {
  const client = buildClient(ctx);
  const { data } = await client.get("/api/users/currentuser");
  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx, client, data.currentUser)
    : {};

  return {
    pageProps,
    ...data,
  };
};
