export interface PendingPhoto {
  uri: string;
  roomId: number;
  orderId: number;
}

export interface LastTags {
  primaryReason: string;
  subReason: string | null;
  note: string | null;
}

let pending: PendingPhoto | null = null;
const lastTagsByRoom: Record<number, LastTags> = {};

export function setPending(orderId: number, roomId: number, uri: string): void {
  pending = { orderId, roomId, uri };
}

export function getPending(): PendingPhoto | null {
  return pending;
}

export function clearPending(): void {
  pending = null;
}

export function setLastTagsForRoom(roomId: number, tags: LastTags): void {
  lastTagsByRoom[roomId] = tags;
}

export function getLastTagsForRoom(roomId: number): LastTags | null {
  return lastTagsByRoom[roomId] ?? null;
}
