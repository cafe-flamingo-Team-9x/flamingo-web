type ReservationRecord = {
  id: string;
  name: string;
  phone: string;
  date: Date;
  time: string;
  comments?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

type SerializableReservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  comments?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeReservation(item: ReservationRecord | null): SerializableReservation | null {
  if (!item) return null;

  return {
    id: item.id.toString(),
    name: item.name,
    phone: item.phone,
    date: item.date.toISOString(),
    time: item.time,
    comments: item.comments ?? null,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export type { SerializableReservation as ReservationDTO };
