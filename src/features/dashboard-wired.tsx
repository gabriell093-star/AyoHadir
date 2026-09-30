import { useCallback, useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Badge, GlassCard, PrimaryButton, Screen, SectionTitle, SoftCard, StatCard } from "@/components/ui";

export function DashboardWiredScreen(){
 const router=useRouter();const{user,profile}=useAuth();const[online,setOnline]=useState<boolean|null>(null);const[attendance,setAttendance]=useState<any[]>([]);const[sessions,setSessions]=useState<any[]>([]);
 const load=useCallback(async()=>{
  const userId=user?.id;
  if(!userId)return;
  const onlineResult=await fetch("https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health").then(r=>r.status<500).catch(()=>false);
  setOnline(Boolean(onlineResult));
  const a=await supabase.from("attendance").select("id,qr_id,status,unique_code,server_recorded_at,scanned_at,qr_sessions(name)").eq("user_id",userId).order("server_recorded_at",{ascending:false}).limit(5);
  setAttendance(a.data||[]);
  const s=await supabase.from("qr_sessions").select("id,name,starts_at,ends_at,status,gps_enabled").eq("owner_id",userId).order("starts_at",{ascending:false}).limit(5);
  setSessions(s.data||[]);
 },[user?.id]);

 useEffect(()=>{
  const initialTimer=setTimeout(()=>{void load();},0);
  const sub=AppState.addEventListener("change",state=>{if(state==="active")void load();});
  return()=>{clearTimeout(initialTimer);sub.remove();};
 },[load]);
 const today=attendance.filter(a=>new Date(a.server_recorded_at||a.scanned_at||0).toDateString()===new Date().toDateString()).length;
 return <Screen bottomNav="home"><Text className="text-[28px] font-black text-gray-950">Halo, {profile?.display_name||"Pengguna"} 👋</Text><View className="mt-2 flex-row gap-2"><Badge tone={user?.email_confirmed_at?"green":"yellow"}>{user?.email_confirmed_at?"✓ Email Terverifikasi":"Email Belum Terverifikasi"}</Badge><Badge tone={online?"green":online===false?"gray":"yellow"}>{online===null?"Mengecek koneksi…":online?"Online":"Offline"}</Badge></View><SoftCard><Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Siap absen?</Text><Text className="mt-2 text-[23px] font-black">Pindai QR dan konfirmasi kehadiran.</Text><Text className="mt-2 text-sm leading-5 text-gray-600">Server memeriksa sesi, akun, waktu, target pengguna, dan GPS bila diperlukan.</Text><PrimaryButton className="mt-4" onPress={()=>router.push("/screens/scan-qr")}><Text className="font-bold text-white">Quick Scan</Text></PrimaryButton></SoftCard><View className="flex-row gap-3"><StatCard label="Absensi hari ini" value={String(today)}/><StatCard label="Riwayat termutakhir" value={String(attendance.length)}/></View><SectionTitle title="Aktivitas Terbaru" action={<Text onPress={()=>router.push("/history")} className="font-bold text-[#3E5219]">Lihat semua</Text>}/><GlassCard>{attendance.length?attendance.map(a=><View key={a.id} className="border-b border-gray-100 py-3"><Text className="font-bold">{a.unique_code||a.id}</Text><Text className="mt-1 text-xs text-gray-500">{a.status||"tercatat"} · {a.server_recorded_at||a.scanned_at}</Text></View>):<Text className="text-sm text-gray-500">Belum ada aktivitas absensi.</Text>}</GlassCard><SectionTitle title="Sesi QR Terbaru"/>{sessions.length?sessions.map(s=><GlassCard key={s.id}><View className="flex-row justify-between"><Text className="flex-1 font-black">{s.name}</Text><Badge>{s.status||"terdaftar"}</Badge></View><Text className="mt-2 text-xs text-gray-500">{s.starts_at} → {s.ends_at}</Text><Text className="mt-2 text-xs text-[#3E5219]" onPress={()=>router.push(s.status==="active"?{pathname:"/screens/active-qr",params:{qr_id:s.id,title:s.name,starts_at:s.starts_at,ends_at:s.ends_at,gps:String(Boolean(s.gps_enabled))}}:{pathname:"/screens/history-session",params:{qr_id:s.id}})}>{s.status==="active"?"Lihat sesi":"Lihat riwayat"}</Text></GlassCard>):<GlassCard><Text className="text-sm text-gray-500">Belum ada sesi QR.</Text></GlassCard>}</Screen>;
}
