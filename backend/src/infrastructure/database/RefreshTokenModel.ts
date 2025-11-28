import { Schema, model, Document } from "mongoose";
import { RefreshToken } from "../../domain/RefreshToken";

type RefreshTokenDocument = RefreshToken & Document;

const RefreshTokenSchema = new Schema<RefreshTokenDocument>({
  userEmail: { type: String, required: true, index: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const RefreshTokenModel = model<RefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);
