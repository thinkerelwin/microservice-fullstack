import mongoose from "mongoose";

import { Password } from "../services/password";

interface UserType {
  email: string;
  password: string;
}

interface UserModal extends mongoose.Model<UserDocument> {
  build(props: UserType): UserDocument;
}

interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function hashPassword(done) {
  // this related to mongoose schema
  if (this.isModified("password")) {
    const hashedPassword = await Password.toHash(this.get("password"));
    this.set("password", hashedPassword);
  }
  done();
});

userSchema.statics.build = buildUser;
// workaround to let typescript step in
function buildUser(props: UserType) {
  return new User(props);
}

const User = mongoose.model<UserDocument, UserModal>("User", userSchema);

export { User };
