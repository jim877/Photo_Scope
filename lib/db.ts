import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('photo_scope.db');

export type ServiceOffering = 'Textiles' | 'Art' | 'Appliance';
export type PrimaryReason =
  | 'Pick Up (PU)'
  | 'In Home'
  | 'Total Loss (TLI)'
  | 'Not Affected'
  | 'Customer Cleaning'
  | 'Other';

export interface OrderRow {
  id: number;
  service_offerings: string; // JSON array
  severity_fire: string; // JSON object
  severity_water: string;
  created_at: string;
}

export interface FloorRow {
  id: number;
  order_id: number;
  name: string;
  severity_override: string | null;
  pu: number;
  tli: number;
  in_home: number;
}

export interface RoomRow {
  id: number;
  floor_id: number;
  name: string;
  display_name: string; // e.g. "1. Kitchen"
  severity_override: string | null;
}

export interface PhotoRow {
  id: number;
  room_id: number;
  file_path: string;
  primary_reason: string;
  sub_reason: string | null;
  note: string | null;
  severity_override: string | null;
  created_at: string;
}

export function initDb(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_offerings TEXT DEFAULT '[]',
      severity_fire TEXT DEFAULT '{}',
      severity_water TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS floors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      name TEXT NOT NULL,
      severity_override TEXT,
      pu INTEGER DEFAULT 0,
      tli INTEGER DEFAULT 0,
      in_home INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      floor_id INTEGER NOT NULL REFERENCES floors(id),
      name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      severity_override TEXT
    );
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      file_path TEXT NOT NULL,
      primary_reason TEXT NOT NULL,
      sub_reason TEXT,
      note TEXT,
      severity_override TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function createOrder(): number {
  const result = db.runSync('INSERT INTO orders (service_offerings, severity_fire, severity_water) VALUES (?, ?, ?)', '[]', '{}', '{}');
  return (result as { lastInsertRowId: number }).lastInsertRowId;
}

export function listOrders(): { id: number; createdAt: string }[] {
  const rows = db.getAllSync('SELECT id, created_at AS createdAt FROM orders ORDER BY id DESC') as { id: number; createdAt: string }[];
  return rows;
}

export function getOrder(id: number): OrderRow | undefined {
  const row = db.getFirstSync('SELECT * FROM orders WHERE id = ?', id) as OrderRow | undefined;
  return row;
}

export function updateOrder(id: number, data: { service_offerings?: string; severity_fire?: string; severity_water?: string }): void {
  if (data.service_offerings != null) db.runSync('UPDATE orders SET service_offerings = ? WHERE id = ?', data.service_offerings, id);
  if (data.severity_fire != null) db.runSync('UPDATE orders SET severity_fire = ? WHERE id = ?', data.severity_fire, id);
  if (data.severity_water != null) db.runSync('UPDATE orders SET severity_water = ? WHERE id = ?', data.severity_water, id);
}

export function listFloors(orderId: number): FloorRow[] {
  return db.getAllSync('SELECT * FROM floors WHERE order_id = ? ORDER BY id', orderId) as FloorRow[];
}

export function addFloor(orderId: number, name: string): number {
  const result = db.runSync('INSERT INTO floors (order_id, name) VALUES (?, ?)', orderId, name);
  return (result as { lastInsertRowId: number }).lastInsertRowId;
}

export function listRooms(floorId: number): RoomRow[] {
  return db.getAllSync('SELECT * FROM rooms WHERE floor_id = ? ORDER BY id', floorId) as RoomRow[];
}

export function addRoom(floorId: number, name: string, floorNumber: number): number {
  const displayName = `${floorNumber}. ${name}`;
  const result = db.runSync('INSERT INTO rooms (floor_id, name, display_name) VALUES (?, ?, ?)', floorId, name, displayName);
  return (result as { lastInsertRowId: number }).lastInsertRowId;
}

export function listPhotos(roomId: number): PhotoRow[] {
  return db.getAllSync('SELECT * FROM photos WHERE room_id = ? ORDER BY created_at', roomId) as PhotoRow[];
}

export function addPhoto(roomId: number, filePath: string, primaryReason: string, subReason: string | null, note: string | null): number {
  const result = db.runSync(
    'INSERT INTO photos (room_id, file_path, primary_reason, sub_reason, note) VALUES (?, ?, ?, ?, ?)',
    roomId,
    filePath,
    primaryReason,
    subReason,
    note ?? null
  );
  return (result as { lastInsertRowId: number }).lastInsertRowId;
}

export function updatePhoto(id: number, data: { primary_reason?: string; sub_reason?: string | null; note?: string | null }): void {
  if (data.primary_reason != null) db.runSync('UPDATE photos SET primary_reason = ? WHERE id = ?', data.primary_reason, id);
  if (data.sub_reason !== undefined) db.runSync('UPDATE photos SET sub_reason = ? WHERE id = ?', data.sub_reason, id);
  if (data.note !== undefined) db.runSync('UPDATE photos SET note = ? WHERE id = ?', data.note, id);
}

export function deletePhoto(id: number): void {
  db.runSync('DELETE FROM photos WHERE id = ?', id);
}
