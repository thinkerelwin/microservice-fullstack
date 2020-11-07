import mongoose from "mongoose";

import { app } from "./app";
startUp();

async function startUp() {
  console.log("test github action...")
  
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("error on connectiong to mongoDB", error);
  }

  app.listen(3000, () => console.log(`Listening on port 3000!!`));
}
