import { natsWrapper } from "./nats-wrapper";

startUp();

async function startUp() {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID is not defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID is not defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL is not defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.getMaxListeners();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

  } catch (error) {
    console.error("error on connectiong to mongoDB", error);
  }
}
