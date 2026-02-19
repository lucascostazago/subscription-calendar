import mongoose, { Schema, type InferSchemaType } from "mongoose";

const RECORRENCIAS = ["mensal", "trimestral", "semestral", "anual"] as const;

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    nome: { type: String, required: true },
    diaRenovacao: { type: String, required: true }, // dia do mês (1-31)
    preco: { type: String, required: true },
    recorrencia: { type: String, required: true, enum: RECORRENCIAS },
    logoUrl: { type: String, default: "" },
    mesInicio: { type: Number, default: 1 }, // 1-12, para trimestral/semestral/anual
  },
  { timestamps: true }
);

export type ISubscription = InferSchemaType<typeof subscriptionSchema>;
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
