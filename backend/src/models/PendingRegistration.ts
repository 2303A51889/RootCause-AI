import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingRegistration extends Document {
  email: string;
  name: string;
  passwordHash: string;
  otpHash: string;
  otpExpiresAt: Date;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true, index: true },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

PendingRegistrationSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingRegistration || mongoose.model<IPendingRegistration>('PendingRegistration', PendingRegistrationSchema);
