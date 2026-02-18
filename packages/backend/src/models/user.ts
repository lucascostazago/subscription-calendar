import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export const User = mongoose.model("User", userSchema);
