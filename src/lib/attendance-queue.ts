import * as SQLite from "expo-sqlite";

export type QueueStatus = "Menunggu sinkronisasi" | "Tersinkronisasi" | "Sinkronisasi tertunda";
export type AttendanceQueueItem = { client_event_id: string; qr_id: string; token: string; token_expires_at: string | null; scanned_at: string; device_id_hash: string; latitude: number | null; longitude: number | null; accuracy: number | null; status: QueueStatus; last_error: string | null };
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
async function getDatabase() {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync("ayohadir.db").then(async db => { await db.execAsync(`PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS attendance_queue (client_event_id TEXT PRIMARY KEY NOT NULL, qr_id TEXT NOT NULL, token TEXT NOT NULL, token_expires_at TEXT, scanned_at TEXT NOT NULL, device_id_hash TEXT NOT NULL, latitude REAL, longitude REAL, accuracy REAL, status TEXT NOT NULL, last_error TEXT, created_at TEXT NOT NULL);`); return db; });
  return databasePromise;
}
export async function enqueueAttendance(item: Omit<AttendanceQueueItem, "status" | "last_error">) { const db = await getDatabase(); await db.runAsync(`INSERT OR REPLACE INTO attendance_queue (client_event_id,qr_id,token,token_expires_at,scanned_at,device_id_hash,latitude,longitude,accuracy,status,last_error,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, item.client_event_id,item.qr_id,item.token,item.token_expires_at,item.scanned_at,item.device_id_hash,item.latitude,item.longitude,item.accuracy,"Menunggu sinkronisasi",null,new Date().toISOString()); }
export async function getAttendanceQueue() { const db = await getDatabase(); return db.getAllAsync<AttendanceQueueItem>(`SELECT client_event_id,qr_id,token,token_expires_at,scanned_at,device_id_hash,latitude,longitude,accuracy,status,last_error FROM attendance_queue ORDER BY created_at ASC`); }
export async function getPendingAttendanceQueue() { return (await getAttendanceQueue()).filter(x => x.status === "Menunggu sinkronisasi" || x.status === "Sinkronisasi tertunda"); }
export async function markAttendanceQueueStatus(clientEventId: string,status: QueueStatus,lastError: string | null = null) { const db = await getDatabase(); await db.runAsync("UPDATE attendance_queue SET status=?, last_error=? WHERE client_event_id=?",status,lastError,clientEventId); }
