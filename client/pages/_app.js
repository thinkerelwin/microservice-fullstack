import "bootstrap/dist/css/bootstrap.css";

import Header from "../components/Header";
import buildClient from "../api/build-client";

export default function CustomApp({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />;
    </div>
  );
}

CustomApp.getInitialProps = async ({ Component, ctx }) => {
  const { data } = await buildClient(ctx).get("/api/users/currentuser");
  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};

  return {
    pageProps,
    ...data,
  };
};
