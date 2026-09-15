import { z } from "zod";
import { text, optionalText, email, password, currencyCode } from "@/lib/validation/common";

export const registerSchema = z
  .object({
    firstName: text(100),
    lastName: text(100),
    email,
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1).max(256),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    firstName: text(100),
    lastName: text(100),
    email,
    phone: optionalText(25),
    location: optionalText(255),
    bio: optionalText(1000),
    profilePicUrl: optionalText(1000),
    preferredCurrency: currencyCode.optional(),
  })
  .strict();

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newPassword: password,
  })
  .strict();
