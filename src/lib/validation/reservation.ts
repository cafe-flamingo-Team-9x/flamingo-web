import { z } from "zod";

export const reservationCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
   email: z.string().email("Email is invalid"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date is invalid"),
  time: z.string().trim().min(1, "Time is required"),
  comments: z.string().trim().optional(),
});

export const reservationUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
