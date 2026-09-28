import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Share, Switch, Text, TextInput, View } from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/auth/auth-context";
import { invokeEdgeFunction, BackendFunctionError } from "@/lib/backend";
import { getDeviceIdHash, getDeviceName } from "@/lib/device-id";
import { enqueueAttendance, getAttendanceQueue, type AttendanceQueueItem } from "@/lib/attendance-queue";
import { syncPendingAttendance } from "@/lib/sync-service";
import { createQrPayload, parseQrPayload } from "@/lib/qr";
import { supabase } from "@/lib/supabase";
import { AppIcon, BackHeader, Badge, ButtonText, DangerButton, GlassCard, OfflineBanner, PrimaryButton, Screen, SecondaryButton, SectionTitle, Segmented, SoftCard } from "@/components/ui";

const GPS_SHARE_WARNING = "Perhatian: QR yang dibagikan secara online memiliki risiko penyalahgunaan. Kami menyarankan mengaktifkan verifikasi lokasi (GPS) untuk meningkatkan keamanan absensi.";
const msg=(e:unknown)=>e instanceof BackendFunctionError||e instanceof Error?e.message:"Terjadi kesalahan.";
const pick=(d:any,...keys:string[])=>{for(const k of keys){const v=d?.[k]??d?.data?.[k]??d?.result?.[k];if(v!==undefined&&v!==null)return v;}return undefined;};
const parseTime=(s:string)=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s.trim());const d=new Date();if(m)d.setHours(Math.min(23,+m[1]),Math.min(59,+m[2]),0,0);return d;};
const timeText=(d:Date)=>d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});
const parseTimeRange=(startText:string,endText:string)=>{
 const start=parseTime(startText),end=parseTime(endText);
 if(end.getTime()<=start.getTime()) end.setDate(end.getDate()+1);
 return {start,end,durationHours:(end.getTime()-start.getTime())/3600000};
};
const attendanceMsg=(s:string)=>{const m=s.toLowerCase();if(m.includes("expired"))return"QR expired.";if(m.includes("invalid")||m.includes("token"))return"QR invalid.";if(m.includes("allow"))return"Anda tidak diizinkan mengikuti sesi ini.";if(m.includes("already")||m.includes("duplicate"))return"Anda sudah absen untuk sesi ini.";if(m.includes("gps")||m.includes("location"))return"Lokasi tidak dapat diverifikasi.";if(m.includes("inactive"))return"Sesi tidak aktif.";if(m.includes("verif"))return"Email perlu diverifikasi sebelum absensi dapat diselesaikan.";return s;};

export function CreateSessionWiredScreen(){
 const router=useRouter();
 const [title,setTitle]=useState("");
 const [target,setTarget]=useState("Semua Pengguna");
 const [duration,setDuration]=useState(2);
 const [late,setLate]=useState(15);
 const [gps,setGps]=useState(false);
 const [radius,setRadius]=useState(150);
 const [start,setStart]=useState(timeText(new Date()));
 const [end,setEnd]=useState(timeText(new Date(Date.now()+7200000)));
 const [users,setUsers]=useState<{id:string;display_name:string|null}[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{
  if(target!=="Pengguna Tertentu"){setUsers([]);setSelected([]);return;}
  void supabase.from("profiles").select("id,display_name").order("display_name",{ascending:true}).limit(100).then(({data,error:e})=>{if(e){setError(e.message);setUsers([]);return;}setUsers(data??[]);});
 },[target]);
 const adjust=(hours:number)=>{const next=Math.max(1,Math.min(24,hours));setDuration(next);const d=parseTime(start);d.setHours(d.getHours()+next);setEnd(timeText(d));};
 const review=()=>{
  setError("");
  if(!title.trim())return setError("Judul sesi wajib diisi.");
  if(!/^\\d{1,2}:\\d{2}$/.test(start.trim())||!/^\\d{1,2}:\\d{2}$/.test(end.trim()))return setError("Waktu mulai dan selesai harus menggunakan format HH:mm.");
  const {start:s,end:e,durationHours}=parseTimeRange(start,end),ms=durationHours*3600000;
  if(ms<3600000||ms>86400000)return setError("Durasi sesi harus antara 1 dan 24 jam.");
  if(target==="Pengguna Tertentu"&&(selected.length<1||selected.length>100))return setError("Pilih minimal 1 dan maksimal 100 pengguna unik.");
  router.push({pathname:"/screens/confirm-qr",params:{title:title.trim(),target,duration:String(Math.round(ms/3600000)),lateMinutes:String(late),gps:String(gps),radius:String(radius),starts_at:s.toISOString(),ends_at:e.toISOString(),allowed_user_ids:JSON.stringify(selected)}});
 };
 return <Screen scroll={false}><BackHeader title="Buat Sesi Absensi"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 px-5 pb-8 pt-4"><View className="flex-row items-center gap-2">{["Info Dasar","Waktu","Lokasi","Review"].map((label,index)=><View key={label} className="flex-1"><View className={"h-1.5 rounded-full "+(index<3?"bg-[#3E5219]":"bg-[#C5C8B8]/40")}/><Text className={"mt-2 text-[10px] font-bold "+(index===0?"text-[#3E5219]":"text-gray-400")}>{label}</Text></View>)}</View><SoftCard><Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Sesi baru</Text><Text className="mt-1 text-xl font-black text-gray-950">Atur sesi sebelum QR dibuat.</Text><Text className="mt-1 text-xs leading-5 text-gray-600">Semua pengaturan akan diperiksa kembali sebelum didaftarkan ke server.</Text></SoftCard><GlassCard><SectionTitle title="1. Info Dasar"/><Text className="mt-4 text-sm font-bold text-gray-900">Judul Sesi</Text><TextInput value={title} onChangeText={setTitle} placeholder="Contoh: Rapat Tim Pagi" placeholderTextColor="#8A8D82" className="mt-2 rounded-2xl border border-[#C5C8B8] bg-[#FAF9F6] px-4 py-3.5 text-base"/><Text className="mt-5 text-sm font-bold text-gray-900">Target Peserta</Text><Segmented items={["Semua Pengguna","Pengguna Tertentu"]} value={target} onChange={setTarget}/>{target==="Pengguna Tertentu"?<View className="mt-4 rounded-2xl border border-[#C5C8B8] bg-white p-3"><Text className="mb-2 text-xs font-semibold text-gray-500">Dipilih: {selected.length}/100</Text>{users.map(u=>{const chosen=selected.includes(u.id);return <Pressable key={u.id} onPress={()=>setSelected(s=>chosen?s.filter(id=>id!==u.id):s.length<100?[...s,u.id]:s)} className="flex-row items-center justify-between border-b border-gray-100 py-3"><Text className="flex-1 font-bold text-gray-900">{u.display_name||"Tanpa nama"}</Text><Badge tone={chosen?"green":"gray"}>{chosen?"Dipilih":"Pilih"}</Badge></Pressable>;})}</View>:null}</GlassCard><GlassCard><SectionTitle title="2. Waktu"/><Text className="mt-4 text-xs font-semibold text-gray-500">Mulai (HH:mm)</Text><TextInput value={start} onChangeText={setStart} keyboardType="numbers-and-punctuation" className="mt-2 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5 text-base"/><Text className="mt-4 text-xs font-semibold text-gray-500">Selesai (HH:mm)</Text><TextInput value={end} onChangeText={setEnd} keyboardType="numbers-and-punctuation" className="mt-2 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5 text-base"/><Text className="mt-4 text-xs font-semibold text-gray-500">Durasi</Text><View className="mt-2 flex-row items-center justify-between rounded-2xl bg-[#F4F3F1] p-2"><Pressable onPress={()=>adjust(duration-1)} className="h-11 w-11 items-center justify-center rounded-xl bg-white"><Text className="text-2xl text-[#3E5219]">−</Text></Pressable><Text className="text-xl font-black text-[#3E5219]">{duration} jam</Text><Pressable onPress={()=>adjust(duration+1)} className="h-11 w-11 items-center justify-center rounded-xl bg-white"><Text className="text-2xl text-[#3E5219]">+</Text></Pressable></View><View className="mt-3 flex-row flex-wrap gap-2">{[1,2,4,8,12,24].map(h=><Pressable key={h} onPress={()=>adjust(h)} className="rounded-full border border-[#C5C8B8] bg-white px-4 py-2.5"><Text className="text-xs font-bold text-[#45483C]">{h} jam</Text></Pressable>)}</View><Text className="mt-4 text-xs font-semibold text-gray-500">Batas terlambat</Text><View className="mt-2 flex-row flex-wrap gap-2">{[10,15,30,60].map(n=><Pressable key={n} onPress={()=>setLate(n)} className={"rounded-full border px-4 py-2.5 "+(late===n?"border-[#3E5219] bg-[#3E5219]":"border-[#C5C8B8] bg-white")}><Text className={"text-xs font-bold "+(late===n?"text-white":"text-[#45483C]")}>{n} menit</Text></Pressable>)}</View></GlassCard><GlassCard><SectionTitle title="3. Lokasi"/><View className="mt-4 flex-row items-center justify-between"><View className="flex-1 pr-4"><Text className="font-bold text-gray-900">Verifikasi lokasi</Text><Text className="mt-1 text-xs leading-5 text-gray-500">Saat QR dibuat, koordinat aktual pembuat menjadi titik pusat.</Text></View><Switch value={gps} onValueChange={setGps}/></View>{gps?<View className="mt-4 flex-row items-center gap-3"><Text className="text-xs font-semibold text-gray-600">Radius</Text><TextInput value={String(radius)} onChangeText={v=>setRadius(Math.max(5,Math.min(3000,Number(v.replace(/\\D/g,""))||5)))} keyboardType="number-pad" className="flex-1 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5 text-base"/><Text className="text-xs font-bold text-[#3E5219]">meter</Text></View>:<View className="mt-4"><OfflineBanner text="GPS nonaktif. QR tetap dapat dibuat tanpa verifikasi lokasi."/></View>}</GlassCard>{error?<View className="rounded-2xl border border-red-100 bg-red-50 p-4"><Text className="font-semibold text-red-700">{error}</Text></View>:null}<PrimaryButton onPress={review}><ButtonText>Review QR</ButtonText></PrimaryButton></ScrollView></Screen>;
}

export function ConfirmQrWiredScreen(){
 const router=useRouter();
 const p=useLocalSearchParams<Record<string,string>>();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const create=async()=>{
  setBusy(true);setError("");
  try{
   const targetMode=p.target==="Pengguna Tertentu"?"specific_users":"all_users";
   let allowedUserIds:string[]=[]; if(p.allowed_user_ids){const parsed=JSON.parse(p.allowed_user_ids);if(Array.isArray(parsed))allowedUserIds=parsed.filter((x):x is string=>typeof x==="string");}
   let latitude:number|null=null,longitude:number|null=null;
   if(p.gps==="true"){const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted)throw new Error("Izin lokasi diperlukan saat GPS diaktifkan.");const location=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});latitude=location.coords.latitude;longitude=location.coords.longitude;}
   const response=await invokeEdgeFunction<any>("create-qr",{name:p.title?.trim()||"",target_mode:targetMode,starts_at:p.starts_at,ends_at:p.ends_at,late_after_minutes:Number(p.lateMinutes||15),gps_enabled:p.gps==="true",latitude,longitude,radius_m:p.gps==="true"?Number(p.radius||150):null,allowed_user_ids:targetMode==="specific_users"?allowedUserIds:[]});
   const qrId=pick(response,"qr_id","id"),token=pick(response,"token"),expires=pick(response,"token_expires_at");
   if(!qrId||!token)throw new Error("Server tidak mengembalikan QR atau token.");
   router.replace({pathname:"/screens/qr-success",params:{qr_id:String(qrId),title:p.title||"Sesi Absensi",target:p.target||"Semua Pengguna",starts_at:p.starts_at||"",ends_at:p.ends_at||"",lateMinutes:p.lateMinutes||"15",gps:p.gps||"false",radius:p.radius||"150",token:String(token),token_expires_at:expires?String(expires):""}});
  }catch(e){setError(msg(e));}finally{setBusy(false);}
 };
 return <Screen><BackHeader title="Konfirmasi QR"/><SoftCard><Text className="text-xs font-bold uppercase tracking-[2px] text-[#3E5219]">Review Sebelum Dibuat</Text><Text className="mt-2 text-2xl font-black text-gray-950">{p.title||"Sesi Absensi"}</Text><Text className="mt-2 text-sm leading-5 text-gray-500">Periksa seluruh pengaturan. QR baru didaftarkan ke server setelah tombol konfirmasi ditekan.</Text></SoftCard><GlassCard>{[["Target",p.target||"Semua Pengguna"],["Mulai",p.starts_at||"-"],["Selesai",p.ends_at||"-"],["Durasi",p.duration?(p.duration+" jam"):"-"],["Batas terlambat",(p.lateMinutes||"15")+" menit"],["GPS",p.gps==="true"?"Aktif · "+(p.radius||"150")+" m":"Nonaktif"]].map(([key,value])=><View key={key} className="flex-row justify-between border-b border-gray-100 py-3"><Text className="text-xs font-semibold text-gray-500">{key}</Text><Text className="max-w-[67%] text-right text-sm font-bold text-gray-900">{value}</Text></View>)}<PrimaryButton className="mt-5" disabled={busy} onPress={()=>void create()}>{busy?<ActivityIndicator color="#FFFFFF"/>:<ButtonText>Konfirmasi & Buat QR</ButtonText>}</PrimaryButton><SecondaryButton className="mt-3" onPress={()=>router.back()} disabled={busy}><Text className="text-sm font-bold text-[#45483C]">Edit Pengaturan</Text></SecondaryButton>{error?<View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4"><Text className="text-sm font-semibold leading-5 text-red-700">{error}</Text></View>:null}</GlassCard></Screen>;
}async function qrFile(ref:any){return await new Promise<string>((resolve,reject)=>{if(!ref?.toDataURL)return reject(new Error("QR belum siap."));ref.toDataURL((data:string)=>{const uri=`${FileSystem.cacheDirectory}ayohadir-${Date.now()}.png`;void FileSystem.writeAsStringAsync(uri,data,{encoding:FileSystem.EncodingType.Base64}).then(()=>resolve(uri)).catch(reject);});});}
async function shareQr(ref:any,gps:boolean){if(!gps)Alert.alert("Peringatan keamanan",GPS_SHARE_WARNING);const uri=await qrFile(ref);if(await Sharing.isAvailableAsync())await Sharing.shareAsync(uri,{mimeType:"image/png",dialogTitle:"Bagikan QR AyoHadir"});else await Share.share({message:"QR AyoHadir",url:uri});}
async function saveQr(ref:any){const p=await MediaLibrary.requestPermissionsAsync();if(!p.granted)throw new Error("Izin galeri diperlukan.");await MediaLibrary.saveToLibraryAsync(await qrFile(ref));}

export function QrSuccessWiredScreen(){const p=useLocalSearchParams<Record<string,string>>();const router=useRouter();const ref=useRef<any>(null);const[token,setToken]=useState(p.token||"");const[expires,setExpires]=useState(p.token_expires_at||"");const rotate=async()=>{try{const r=await invokeEdgeFunction<any>("rotate-qr-token",{qr_id:p.qr_id});setToken(pick(r,"token")||token);setExpires(pick(r,"token_expires_at")||expires);}catch(e){Alert.alert("Token",msg(e));}};useEffect(()=>{const i=setInterval(()=>void rotate(),600000);return()=>clearInterval(i);},[p.qr_id]);const left=expires?Math.max(0,Math.floor((Date.parse(expires)-Date.now())/1000)):null;return <Screen><BackHeader title="QR Berhasil Dibuat"/><GlassCard className="items-center"><Badge>Aktif</Badge><Text className="mt-3 text-xl font-black">{p.title}</Text><View className="mt-5 rounded-xl border-2 border-[#DDE8C9] bg-white p-4"><QRCode getRef={(r:any)=>{ref.current=r}} value={createQrPayload({qr_id:p.qr_id||"",token,token_expires_at:expires||undefined,gps_enabled:p.gps==="true"})} size={220}/></View><Text className="mt-3 text-xs text-gray-500">{left===null?"Token server":left===0?"Token kedaluwarsa":`Token aktif ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`}</Text></GlassCard><View className="flex-row gap-3"><SecondaryButton className="flex-1" onPress={()=>void shareQr(ref.current,p.gps==="true")}><Text className="font-bold">Bagikan</Text></SecondaryButton><SecondaryButton className="flex-1" onPress={()=>void saveQr(ref.current)}><Text className="font-bold">Unduh</Text></SecondaryButton></View><PrimaryButton onPress={()=>router.push({pathname:"/screens/active-qr",params:{...p,token,token_expires_at:expires}})}><ButtonText>Lihat Sesi</ButtonText></PrimaryButton></Screen>}

export function ActiveQrWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>(); const router=useRouter(); const ref=useRef<any>(null);
 const [token,setToken]=useState(p.token||""); const [expires,setExpires]=useState(p.token_expires_at||""); const [rotating,setRotating]=useState(false); const [now,setNow]=useState(Date.now()); const [info,setInfo]=useState<any|null>(null);

 const loadInfo=async()=>{
  if(!p.qr_id)return;
  const {data}=await supabase.rpc("get_qr_owner_details",{p_qr_id:p.qr_id});
  const row=Array.isArray(data)?data[0]:data;
  if(row)setInfo(row);
 };

 const rotate=async()=>{
  if(!p.qr_id||rotating)return;
  setRotating(true);
  try{
   const r=await invokeEdgeFunction<any>("rotate-qr-token",{qr_id:p.qr_id});
   const nextToken=pick(r,"token"); const nextExpires=pick(r,"token_expires_at");
   if(nextToken)setToken(String(nextToken));
   if(nextExpires)setExpires(String(nextExpires));
  }catch(e){Alert.alert("Token",msg(e));}
  finally{setRotating(false);}
 };

 useEffect(()=>{
  void loadInfo();
  void rotate();
  const refresh=setInterval(()=>void rotate(),600000);
  const clock=setInterval(()=>setNow(Date.now()),1000);
  return()=>{clearInterval(refresh);clearInterval(clock);};
 },[p.qr_id]);

 const remaining=expires?Math.max(0,Math.floor((Date.parse(expires)-now)/1000)):null;
 const sessionEnded=p.ends_at?Date.parse(p.ends_at)<=now:false;
 const countdown=remaining===null?"-":String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");

 const remove=async()=>{
  try{await invokeEdgeFunction("delete-qr",{qr_id:p.qr_id});router.replace("/history");}
  catch(e){Alert.alert("Hapus sesi",msg(e));}
 };

 const openArchive=()=>router.replace({pathname:"/screens/history-session",params:{qr_id:p.qr_id||""}});
 const openMap=()=>{
  if(info?.latitude==null||info?.longitude==null)return;
  void Linking.openURL("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(info.latitude+","+info.longitude));
 };

 return <Screen>
  <BackHeader title="Detail Sesi QR"/>
  <Text className="text-2xl font-black text-[#3E5219]">{p.title||info?.name||"Sesi QR"}</Text>
  <Text className="mt-1 text-xs text-gray-500">{p.starts_at||info?.starts_at||""} → {p.ends_at||info?.ends_at||""}</Text>
  {sessionEnded?<SoftCard><Text className="font-black text-gray-900">Sesi ini sudah kedaluwarsa</Text><Text className="mt-1 text-xs leading-5 text-gray-600">QR tidak dapat digunakan lagi. Riwayat absensi tetap tersimpan sebagai arsip.</Text><PrimaryButton className="mt-4" onPress={openArchive}><ButtonText>Lihat Arsip</ButtonText></PrimaryButton></SoftCard>:null}
  <GlassCard className="mt-5 items-center">
   <View className="flex-row items-center gap-2">
    <Badge tone={sessionEnded||remaining===0?"red":"green"}>{sessionEnded?"Sesi Kedaluwarsa":remaining===0?"Token Kedaluwarsa":"QR Aktif"}</Badge>
    {rotating&&!sessionEnded?<ActivityIndicator size="small" color="#3E5219"/>:null}
   </View>
   <Text className="mt-3 text-4xl font-black tracking-[2px] text-[#3E5219]">{sessionEnded?"--:--":countdown}</Text>
   <Text className="mt-1 text-xs text-gray-500">{sessionEnded?"Sesi telah berakhir":remaining===0?"Token perlu diperbarui.":"Sisa token dinamis"}</Text>
   {!sessionEnded?<View className="mt-4 rounded-xl border-2 border-[#DDE8C9] bg-white p-4">
    <QRCode getRef={(r:any)=>{ref.current=r}} value={createQrPayload({qr_id:p.qr_id||"",token,token_expires_at:expires||undefined,gps_enabled:p.gps==="true"})} size={232}/>
   </View>:null}
   {!sessionEnded?<Text className="mt-3 text-[11px] text-gray-400">{expires?("Berlaku sampai "+new Date(expires).toLocaleTimeString()):"Menunggu token server"}</Text>:null}
  </GlassCard>
  {!sessionEnded&&remaining===0?<PrimaryButton onPress={()=>void rotate()} disabled={rotating}><ButtonText>{rotating?"Memperbarui token…":"Perbarui token"}</ButtonText></PrimaryButton>:null}
  {!sessionEnded?<View className="flex-row gap-3">
   <SecondaryButton className="flex-1" onPress={()=>void shareQr(ref.current,p.gps==="true")}><Text className="font-bold">Bagikan QR</Text></SecondaryButton>
   <SecondaryButton className="flex-1" onPress={()=>void saveQr(ref.current)}><Text className="font-bold">Download</Text></SecondaryButton>
  </View>:null}
  {info?.gps_enabled?<GlassCard><Text className="text-sm font-black text-[#3E5219]">Verifikasi lokasi aktif</Text><Text className="mt-1 text-xs leading-5 text-gray-600">Radius {info.radius_m} m · Pusat {Number(info.latitude).toFixed(6)}, {Number(info.longitude).toFixed(6)}</Text>{info.latitude!=null&&info.longitude!=null?<SecondaryButton className="mt-3" onPress={openMap}><Text className="text-sm font-bold text-[#3E5219]">Buka Peta</Text></SecondaryButton>:null}</GlassCard>:<GlassCard><Text className="text-xs text-gray-500">GPS tidak digunakan pada sesi ini.</Text></GlassCard>}
  <View className="flex-row gap-3">
   <SecondaryButton className="flex-1" onPress={()=>router.push({pathname:"/screens/edit-qr",params:{qr_id:p.qr_id||""}})} disabled={sessionEnded}><Text className="font-bold text-[#3E5219]">Edit Sesi</Text></SecondaryButton>
   <SecondaryButton className="flex-1" onPress={openArchive}><Text className="font-bold">Riwayat Kehadiran</Text></SecondaryButton>
  </View>
  <SecondaryButton onPress={()=>router.push("/screens/cancellation-review")}>
   <Text className="font-bold text-[#3E5219]">Review Pembatalan</Text>
  </SecondaryButton>
  <DangerButton onPress={()=>void remove()}><Text className="font-bold text-red-700">Hapus Sesi</Text></DangerButton>
 </Screen>;
}

export function ScanQrWiredScreen(){const router=useRouter();const[permission,requestPermission]=useCameraPermissions();const[torch,setTorch]=useState(false);const[busy,setBusy]=useState(false);const[error,setError]=useState("");const scan=async(raw:string)=>{if(busy)return;setBusy(true);setError("");try{const qr=parseQrPayload(raw),scanned_at=new Date().toISOString(),client_event_id=Crypto.randomUUID(),device_id_hash=await getDeviceIdHash(),device_name=getDeviceName();let loc:any=null;const collectLocation=qr.gps_enabled!==false;try{if(collectLocation&&(await Location.getForegroundPermissionsAsync()).granted)loc=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});}catch{}const online=await fetch("https://sqrvntrxoytjnbgticpd.supabase.co/auth/v1/health").then(r=>r.ok).catch(()=>false);if(!online){if(!qr.token_expires_at||Date.parse(qr.token_expires_at)<=Date.parse(scanned_at))throw new Error("QR expired atau masa berlaku tidak tersedia untuk mode offline.");await enqueueAttendance({client_event_id,qr_id:qr.qr_id,token:qr.token,token_expires_at:qr.token_expires_at,scanned_at,device_id_hash,latitude:loc?.coords.latitude??null,longitude:loc?.coords.longitude??null,accuracy_meters:loc?.coords.accuracy??null,device_name});router.replace({pathname:"/screens/attendance-proof",params:{queued:"true",client_event_id,device_name}});return;}const r=await invokeEdgeFunction<any>("record-attendance",{qr_id:qr.qr_id,token:qr.token,scanned_at,device_id_hash,latitude:loc?.coords.latitude??null,longitude:loc?.coords.longitude??null,accuracy_meters:loc?.coords.accuracy??null,device_name,client_event_id,sync_status:"online"});router.replace({pathname:"/screens/attendance-proof",params:{attendance_id:String(pick(r,"attendance_id","id")||""),unique_code:String(pick(r,"unique_code")||""),attendance_status:String(pick(r,"attendance_status","status")||""),location_verified:String(Boolean(pick(r,"location_verified"))),server_recorded_at:String(pick(r,"server_recorded_at")||""),device_name}});}catch(e){setError(attendanceMsg(msg(e)));}finally{setBusy(false);}};const album=async()=>{try{const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],quality:1});if(r.canceled)return;const uri=r.assets[0]?.uri;if(!uri)throw new Error("Gambar tidak ditemukan.");const codes=await Camera.scanFromURLAsync(uri,["qr"]);if(!codes.length)throw new Error("QR tidak ditemukan pada gambar yang dipilih.");await scan(codes[0].data);}catch(e){setError(attendanceMsg(msg(e)));}};if(!permission?.granted)return <Screen><BackHeader title="Scan QR"/><GlassCard><Text className="text-lg font-black">Izin kamera diperlukan</Text><PrimaryButton className="mt-5" onPress={requestPermission}><ButtonText>Izinkan Kamera</ButtonText></PrimaryButton><SecondaryButton className="mt-3" onPress={()=>void album()}><Text className="font-bold">Dari Album</Text></SecondaryButton></GlassCard></Screen>;return <View className="flex-1 bg-black"><CameraView style={{flex:1}} facing="back" enableTorch={torch} barcodeScannerSettings={{barcodeTypes:["qr"]}} onBarcodeScanned={({data})=>void scan(data)}><View className="flex-1 items-center justify-center"><View className="h-64 w-64 rounded-3xl border-2 border-white"/><Text className="mt-5 rounded-full bg-black/60 px-4 py-2 text-white">Arahkan QR ke dalam bingkai</Text></View><View className="absolute bottom-0 left-0 right-0 flex-row justify-around bg-black/70 pb-10 pt-4"><Pressable onPress={()=>void album()}><Text className="font-bold text-white">Dari Album</Text></Pressable><Pressable onPress={()=>setTorch(v=>!v)}><Text className="font-bold text-white">Flash</Text></Pressable></View>{busy?<View className="absolute inset-0 items-center justify-center"><ActivityIndicator size="large" color="#FFF"/></View>:null}{error?<View className="absolute left-5 right-5 top-16 rounded-2xl bg-white p-4"><Text className="font-bold text-red-700">{error}</Text><Pressable className="mt-3" onPress={()=>setError("")}><Text className="font-bold text-[#3E5219]">Tutup</Text></Pressable></View>:null}</CameraView></View>}

export function AttendanceProofWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>(); const router=useRouter();
 return <Screen><BackHeader title="Bukti Absensi"/><SoftCard><Text className="text-xs font-bold uppercase tracking-[2px] text-[#3E5219]">{p.queued==="true"?"Menunggu sinkronisasi":"Absensi tervalidasi server"}</Text><Text className="mt-2 text-2xl font-black text-gray-950">{p.queued==="true"?"Absensi tersimpan di perangkat":"Absensi tercatat"}</Text><Text className="mt-2 text-sm leading-5 text-gray-600">{p.queued==="true"?"Data akan divalidasi server saat koneksi tersedia.":"Bukti ini menggunakan hasil validasi server AyoHadir."}</Text></SoftCard><GlassCard>{[["Sesi",p.session_name],["Kode unik",p.unique_code],["Status",p.attendance_status],["Waktu scan",p.scanned_at],["Tercatat server",p.server_recorded_at],["Perangkat",p.device_name],["Lokasi terverifikasi",p.location_verified]].map(([k,v])=>v?<View key={k} className="flex-row justify-between border-b border-gray-100 py-3"><Text className="text-xs text-gray-500">{k}</Text><Text className="max-w-[62%] text-right text-sm font-bold text-gray-900">{v}</Text></View>:null)}{p.queued==="true"?<><Badge tone="yellow">Menunggu sinkronisasi</Badge><SecondaryButton className="mt-4" onPress={()=>router.push("/screens/sync-data")}><Text className="text-sm font-bold text-[#3E5219]">Lihat Sinkronisasi</Text></SecondaryButton></>:null}</GlassCard>{p.queued!=="true"&&p.attendance_id?<SecondaryButton onPress={()=>router.push({pathname:"/screens/cancellation-request",params:{attendance_id:p.attendance_id}})}><Text className="text-sm font-bold text-red-700">Ajukan Pembatalan</Text></SecondaryButton>:null}</Screen>;
}export function HistoryWiredScreen(){
 const {user}=useAuth(); const router=useRouter();
 const [mode,setMode]=useState("Absensi Saya"); const [query,setQuery]=useState("");
 const [statusFilter,setStatusFilter]=useState("Semua");
 const [rows,setRows]=useState<any[]>([]); const [sessions,setSessions]=useState<any[]>([]);
 const [loading,setLoading]=useState(false);

 const load=async()=>{
  if(!user?.id)return;
  setLoading(true);
  try{
   const [a,s]=await Promise.all([
    supabase.from("attendance").select("id,qr_id,status,unique_code,device_name,location_verified,location_accuracy_meters,server_recorded_at,scanned_at,sync_status,qr_sessions(name)").eq("user_id",user.id).order("server_recorded_at",{ascending:false}).limit(100),
    supabase.from("qr_sessions").select("id,name,starts_at,ends_at,status,gps_enabled").eq("owner_id",user.id).order("starts_at",{ascending:false}).limit(100)
   ]);
   setRows(a.data??[]);
   setSessions(s.data??[]);
  }finally{setLoading(false);}
 };

 useEffect(()=>{void load();},[user?.id]);

 const q=query.trim().toLowerCase();
 const filteredRows=rows.filter(r=>{
  const matchesSearch=[r.qr_sessions?.name,r.unique_code,r.status,r.server_recorded_at].join(" ").toLowerCase().includes(q);
  const matchesStatus=statusFilter==="Semua"||(statusFilter==="Hadir"&&r.status==="present")||(statusFilter==="Terlambat"&&r.status==="late");
  return matchesSearch&&matchesStatus;
 });
 const filteredSessions=sessions.filter(s=>[s.name,s.status,s.starts_at,s.ends_at].join(" ").toLowerCase().includes(q));

 return <Screen bottomNav="history">
  <View><Text className="text-[28px] font-black text-gray-950">Riwayat Absensi</Text><Text className="mt-1 text-sm leading-5 text-gray-500">Cari absensi Anda atau sesi QR yang Anda buat.</Text></View>
  <Segmented items={["Absensi Saya","Sesi Saya"]} value={mode} onChange={setMode}/>
  <View className="flex-row items-center rounded-2xl border border-[#C5C8B8] bg-white px-4" style={{minHeight:54}}>
   <AppIcon name="history" size={22} color="#75796B"/>
   <TextInput value={query} onChangeText={setQuery} className="ml-3 flex-1 py-3.5 text-base text-gray-900" placeholder="Cari riwayat, sesi, atau kode…" placeholderTextColor="#8A8D82" autoCapitalize="none" autoCorrect={false}/>
   {query?<Pressable onPress={()=>setQuery("")} className="h-8 w-8 items-center justify-center rounded-full bg-[#F4F3F1]"><AppIcon name="close" size={17} color="#75796B"/></Pressable>:null}
  </View>
  {mode==="Absensi Saya"?<Segmented items={["Semua","Hadir","Terlambat"]} value={statusFilter} onChange={setStatusFilter}/>:null}
  <SecondaryButton onPress={()=>void load()} disabled={loading}>{loading?<ActivityIndicator/>:<Text className="font-bold text-gray-800">Refresh</Text>}</SecondaryButton>

  {mode==="Absensi Saya"
   ?(filteredRows.length?filteredRows.map(row=><GlassCard key={row.id}>
      <View className="flex-row items-start justify-between">
       <View className="flex-1 pr-3"><Text className="text-base font-black text-gray-900">{row.qr_sessions?.name||"Sesi QR"}</Text><Text className="mt-1 text-xs text-gray-500">{row.server_recorded_at||row.scanned_at||"-"}</Text></View>
       <Badge tone={row.status==="cancelled"?"red":row.status==="late"?"yellow":"green"}>{row.status==="cancelled"?"Dibatalkan":row.status==="late"?"Terlambat":"Hadir"}</Badge>
      </View>
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
       <Text className="text-[11px] font-black tracking-[1px] text-gray-400">{row.unique_code||"-"}</Text>
       <Pressable onPress={()=>router.push({pathname:"/screens/attendance-proof",params:{attendance_id:row.id,session_name:row.qr_sessions?.name||"Sesi QR",unique_code:row.unique_code||"",attendance_status:row.status||"",scanned_at:row.scanned_at||"",server_recorded_at:row.server_recorded_at||"",device_name:row.device_name||"",location_verified:row.location_verified===true?"Terverifikasi":row.location_verified===false?"Tidak terverifikasi":"",sync_status:row.sync_status||""}})}><Text className="font-bold text-[#3E5219]">Detail</Text></Pressable>
      </View>
     </GlassCard>):<GlassCard><Text className="font-bold text-gray-900">Tidak ada hasil untuk filter ini.</Text></GlassCard>)
   :(filteredSessions.length?filteredSessions.map(session=><GlassCard key={session.id}>
      <View className="flex-row items-start justify-between"><Text className="flex-1 pr-3 text-base font-black text-gray-900">{session.name}</Text><Badge tone={session.status==="active"?"green":session.status==="expired"?"gray":"red"}>{session.status||""}</Badge></View>
      <Text className="mt-2 text-xs text-gray-500">{session.starts_at} → {session.ends_at}</Text>
      <PrimaryButton className="mt-4" onPress={()=>router.push(session.status==="active"?{pathname:"/screens/active-qr",params:{qr_id:session.id,title:session.name,starts_at:session.starts_at,ends_at:session.ends_at,gps:String(Boolean(session.gps_enabled))}}:{pathname:"/screens/history-session",params:{qr_id:session.id}})}><ButtonText>{session.status==="active"?"Lihat Sesi":"Lihat Riwayat"}</ButtonText></PrimaryButton>
     </GlassCard>):<GlassCard><Text className="font-bold text-gray-900">Belum ada sesi QR yang dibuat.</Text></GlassCard>)}
 </Screen>;
}

export function HistorySessionWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>(); const router=useRouter();
 const [rows,setRows]=useState<any[]>([]); const [info,setInfo]=useState<any|null>(null);
 const [missingUsers,setMissingUsers]=useState<{user_id:string;display_name:string|null}[]>([]);
 const [missingTotal,setMissingTotal]=useState(0); const [missingOffset,setMissingOffset]=useState(0); const [error,setError]=useState("");

 const load=async()=>{
  if(!p.qr_id)return;
  setError(""); setMissingOffset(0);
  const [infoResult,attendanceResult,missingResult]=await Promise.all([
   supabase.rpc("get_qr_owner_details",{p_qr_id:p.qr_id}),
   supabase.from("attendance").select("id,user_id,status,unique_code,device_name,server_recorded_at,scanned_at,sync_status,location_verified,location_accuracy_meters,profiles(display_name)").eq("qr_id",p.qr_id).order("server_recorded_at",{ascending:false}),
   supabase.rpc("get_qr_owner_missing_users",{p_qr_id:p.qr_id,p_limit:50,p_offset:0})
  ]);
  const detail=Array.isArray(infoResult.data)?infoResult.data[0]:infoResult.data;
  if(infoResult.error||!detail){setError(infoResult.error?.message||"Detail sesi tidak tersedia.");return;}
  if(attendanceResult.error){setError(attendanceResult.error.message);return;}
  if(missingResult.error){setError(missingResult.error.message);return;}
  const missing=(missingResult.data??[]).map((row:any)=>({user_id:String(row.user_id),display_name:row.display_name??null}));
  setInfo(detail); setRows(attendanceResult.data??[]); setMissingUsers(missing);
  setMissingTotal(Number(missingResult.data?.[0]?.total_count??0));
 };

 const loadMoreMissing=async()=>{
  if(!p.qr_id||missingUsers.length>=missingTotal)return;
  const nextOffset=missingOffset+missingUsers.length;
  const {data,error:e}=await supabase.rpc("get_qr_owner_missing_users",{p_qr_id:p.qr_id,p_limit:50,p_offset:nextOffset});
  if(e){setError(e.message);return;}
  const next=(data??[]).map((row:any)=>({user_id:String(row.user_id),display_name:row.display_name??null}));
  setMissingOffset(nextOffset);
  setMissingUsers(current=>[...current,...next]);
 };

 useEffect(()=>{void load();},[p.qr_id]);

 const syncLabel=(status:string|null|undefined)=>{
  if(status==="synced")return "Tersinkronisasi";
  if(status==="delayed")return "Sinkronisasi tertunda";
  if(status==="pending")return "Menunggu sinkronisasi";
  return "Online";
 };
 const openMap=()=>{
  if(info?.latitude==null||info?.longitude==null)return;
  void Linking.openURL("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(info.latitude+","+info.longitude));
 };
 const attendedCount=new Set(rows.map((row:any)=>row.user_id)).size;
 const missingCount=missingTotal;

 return <Screen>
  <BackHeader title="Riwayat Kehadiran"/>
  {error?<GlassCard><Text className="font-semibold text-red-700">{error}</Text></GlassCard>:null}
  {info?<GlassCard>
   <Text className="text-xs font-black uppercase tracking-[2px] text-[#3E5219]">Ringkasan Sesi</Text>
   <Text className="mt-2 text-xl font-black text-gray-950">{info.name||"Sesi QR"}</Text>
   <View className="mt-4 flex-row gap-3">
    <View className="flex-1 rounded-2xl bg-[#F4F3F1] p-3"><Text className="text-xs text-gray-500">Sudah absen</Text><Text className="mt-1 text-2xl font-black text-[#3E5219]">{attendedCount}</Text></View>
    <View className="flex-1 rounded-2xl bg-[#F4F3F1] p-3"><Text className="text-xs text-gray-500">Belum absen</Text><Text className="mt-1 text-2xl font-black text-gray-900">{missingCount}</Text></View>
   </View>
   {info.gps_enabled
    ?<View className="mt-4 rounded-2xl border border-[#DDE8C9] bg-[#F2F5E8] p-4"><Text className="text-sm font-black text-[#3E5219]">Verifikasi lokasi aktif</Text><Text className="mt-1 text-xs leading-5 text-gray-600">Radius {info.radius_m} m · Pusat {Number(info.latitude).toFixed(6)}, {Number(info.longitude).toFixed(6)}</Text>{info.latitude!=null&&info.longitude!=null?<SecondaryButton className="mt-3" onPress={openMap}><Text className="text-sm font-bold text-[#3E5219]">Buka Peta</Text></SecondaryButton>:null}</View>
    :<Text className="mt-4 text-xs text-gray-500">GPS tidak digunakan pada sesi ini.</Text>}
   {missingUsers.length?<View className="mt-4"><Text className="text-sm font-black text-gray-900">Belum absen</Text>{missingUsers.map(user=><Text key={user.user_id} className="mt-1 text-xs text-gray-600">• {user.display_name||"Tanpa nama"}</Text>)}{missingUsers.length<missingTotal?<SecondaryButton className="mt-3" onPress={()=>void loadMoreMissing()}><Text className="text-sm font-bold text-[#3E5219]">Muat berikutnya</Text></SecondaryButton>:null}</View>:<Text className="mt-4 text-xs text-gray-500">Semua pengguna dalam target sesi sudah absen.</Text>}
  </GlassCard>:null}
  {rows.length?rows.map(row=><GlassCard key={row.id}>
   <View className="flex-row items-start justify-between"><View className="flex-1"><Text className="font-black text-gray-900">{row.profiles?.display_name||"Pengguna"}</Text><Text className="mt-1 text-xs text-gray-500">{row.unique_code||"-"}</Text><Text className="mt-1 text-[11px] text-gray-400">{row.server_recorded_at||row.scanned_at||"-"}</Text></View><Badge tone={row.status==="late"?"yellow":row.status==="cancelled"?"red":"green"}>{row.status==="late"?"Terlambat":row.status==="cancelled"?"Dibatalkan":"Hadir"}</Badge></View>
   <View className="mt-3 flex-row flex-wrap gap-2"><Badge tone={row.location_verified===true?"green":row.location_verified===false?"red":"gray"}>{row.location_verified===true?"GPS valid":row.location_verified===false?"GPS tidak valid":"GPS tidak digunakan"}</Badge><Badge tone={row.sync_status==="synced"?"green":row.sync_status==="delayed"?"red":"yellow"}>{syncLabel(row.sync_status)}</Badge>{row.location_accuracy_meters!=null?<Badge tone="gray">Akurasi {Math.round(Number(row.location_accuracy_meters))} m</Badge>:null}{row.device_name?<Badge tone="gray">{row.device_name}</Badge>:null}</View>
   {row.status!=="cancelled"?<SecondaryButton className="mt-4" onPress={()=>router.push({pathname:"/screens/owner-cancel-attendance",params:{attendance_id:row.id,user_name:row.profiles?.display_name||"Pengguna",qr_id:p.qr_id||""}})}><Text className="text-sm font-bold text-red-700">Batalkan Absensi</Text></SecondaryButton>:null}
  </GlassCard>):<GlassCard><Text className="font-bold text-gray-900">Belum ada absensi untuk sesi ini.</Text></GlassCard>}
 </Screen>;
}

export function NotificationsWiredScreen(){
 const {user}=useAuth(); const [items,setItems]=useState<any[]>([]);
 const load=async()=>{if(!user?.id)return;const{data}=await supabase.from("notifications").select("id,title,body,type,read_at,created_at,data").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);setItems(data??[]);};
 const mark=async(id:string)=>{const{error}=await supabase.rpc("mark_notification_read",{p_notification_id:id});if(!error)setItems(current=>current.map(item=>item.id===id?{...item,read_at:item.read_at??new Date().toISOString()}:item));};
 useEffect(()=>{void load();if(!user?.id)return;const channel=supabase.channel("notifications-"+user.id).on("postgres_changes",{event:"*",schema:"public",table:"notifications",filter:"user_id=eq."+user.id},()=>void load()).subscribe();return()=>{void supabase.removeChannel(channel);};},[user?.id]);
 return <Screen bottomNav="notifications"><View className="flex-row items-center justify-between"><View><Text className="text-[28px] font-black text-gray-950">Notifikasi</Text><Text className="mt-1 text-sm text-gray-500">Pembaruan absensi, QR, dan sinkronisasi.</Text></View><Pressable onPress={()=>void load()} className="rounded-full bg-[#E4F1D2] px-3 py-2"><Text className="text-xs font-bold text-[#3E5219]">Refresh</Text></Pressable></View>{items.length?items.map(item=><Pressable key={item.id} onPress={()=>void mark(item.id)}><GlassCard className={item.read_at?"opacity-70":""}><View className="flex-row items-start justify-between"><Text className="flex-1 text-sm font-black text-gray-900">{item.title||item.type||"Notifikasi"}</Text>{!item.read_at?<Badge tone="yellow">Baru</Badge>:null}</View><Text className="mt-2 text-sm leading-5 text-gray-600">{item.body||""}</Text><Text className="mt-2 text-[11px] text-gray-400">{item.created_at||""}</Text></GlassCard></Pressable>):<GlassCard><Text className="font-bold text-gray-900">Belum ada notifikasi.</Text></GlassCard>}</Screen>;
}export function EditQrWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>(); const router=useRouter();
 const [loaded,setLoaded]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const [title,setTitle]=useState(""); const [target,setTarget]=useState("Semua Pengguna"); const [duration,setDuration]=useState(1); const [late,setLate]=useState(15); const [gps,setGps]=useState(false); const [radius,setRadius]=useState(150); const [start,setStart]=useState(""); const [end,setEnd]=useState(""); const [lat,setLat]=useState<number|null>(null); const [lon,setLon]=useState<number|null>(null);
 const [users,setUsers]=useState<{id:string;display_name:string|null}[]>([]); const [selected,setSelected]=useState<string[]>([]);
 const load=async()=>{setError("");if(!p.qr_id)return;const{data,error:e}=await supabase.rpc("get_qr_owner_details",{p_qr_id:p.qr_id});const row=Array.isArray(data)?data[0]:data;if(e||!row){setError(e?.message||"Sesi QR tidak ditemukan.");return;}setTitle(row.name||"");setTarget(row.target_mode==="specific_users"?"Pengguna Tertentu":"Semua Pengguna");setLate(Number(row.late_after_minutes||15));setGps(Boolean(row.gps_enabled));setRadius(Number(row.radius_m||150));setLat(typeof row.latitude==="number"?row.latitude:null);setLon(typeof row.longitude==="number"?row.longitude:null);const sd=new Date(row.starts_at),ed=new Date(row.ends_at);setStart(timeText(sd));setEnd(timeText(ed));setDuration(Math.max(1,Math.min(24,Math.round((ed.getTime()-sd.getTime())/3600000))));const{data:allowed}=await supabase.from("qr_allowed_users").select("user_id").eq("qr_id",p.qr_id);setSelected((allowed??[]).map((x:any)=>x.user_id));setLoaded(true);};
 useEffect(()=>{void load();},[p.qr_id]);
 useEffect(()=>{if(target!=="Pengguna Tertentu")return;void supabase.from("profiles").select("id,display_name").order("display_name",{ascending:true}).limit(100).then(({data})=>setUsers(data??[]));},[target]);
 const save=async()=>{if(busy)return;setError("");if(!/^\\d{1,2}:\\d{2}$/.test(start)||!/^\\d{1,2}:\\d{2}$/.test(end))return setError("Waktu mulai dan selesai harus menggunakan format HH:mm.");const {start:s,end:e,durationHours}=parseTimeRange(start,end),ms=durationHours*3600000;if(ms<3600000||ms>86400000)return setError("Durasi sesi harus antara 1 dan 24 jam.");if(target==="Pengguna Tertentu"&&(selected.length<1||selected.length>100))return setError("Pilih minimal 1 dan maksimal 100 pengguna unik.");let latitude=lat,longitude=lon;if(gps&&(latitude===null||longitude===null)){const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted)return setError("Izin lokasi diperlukan saat GPS diaktifkan.");const loc=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});latitude=loc.coords.latitude;longitude=loc.coords.longitude;}if(gps&&(latitude===null||longitude===null))return setError("Lokasi pusat QR tidak tersedia.");setBusy(true);try{await invokeEdgeFunction("update-qr",{qr_id:p.qr_id,name:title.trim(),target_mode:target==="Pengguna Tertentu"?"specific_users":"all_users",starts_at:s.toISOString(),ends_at:e.toISOString(),late_after_minutes:late,gps_enabled:gps,latitude:gps?latitude:null,longitude:gps?longitude:null,radius_m:gps?radius:null,allowed_user_ids:target==="Pengguna Tertentu"?selected:[]});router.replace({pathname:"/screens/active-qr",params:{qr_id:p.qr_id,title:title.trim(),starts_at:s.toISOString(),ends_at:e.toISOString(),gps:String(gps),radius:String(radius)}});}catch(err){setError(msg(err));}finally{setBusy(false);}};
 if(!loaded)return <Screen><BackHeader title="Edit QR"/><GlassCard><ActivityIndicator/><Text className="mt-3 text-sm text-gray-500">Memuat sesi…</Text></GlassCard></Screen>;
 return <Screen><BackHeader title="Edit Sesi QR"/><SoftCard><Text className="text-xs font-bold uppercase tracking-[2px] text-[#3E5219]">Pemilik QR</Text><Text className="mt-1 text-xl font-black text-gray-950">Edit sesi yang masih aktif</Text><Text className="mt-1 text-xs leading-5 text-gray-600">Perubahan divalidasi server dan dicatat ke audit log. Token lama akan dicabut setelah perubahan.</Text></SoftCard><GlassCard><Text className="text-sm font-bold">Judul Sesi</Text><TextInput value={title} onChangeText={setTitle} className="mt-2 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5"/><Text className="mt-5 text-sm font-bold">Target Peserta</Text><Segmented items={["Semua Pengguna","Pengguna Tertentu"]} value={target} onChange={setTarget}/>{target==="Pengguna Tertentu"?<View className="mt-4 rounded-2xl border border-[#C5C8B8] p-3">{users.map(u=>{const chosen=selected.includes(u.id);return <Pressable key={u.id} onPress={()=>setSelected(v=>chosen?v.filter(x=>x!==u.id):v.length<100?[...v,u.id]:v)} className="flex-row items-center justify-between border-b border-gray-100 py-3"><Text className="flex-1 font-bold">{u.display_name||"Tanpa nama"}</Text><Badge tone={chosen?"green":"gray"}>{chosen?"Dipilih":"Pilih"}</Badge></Pressable>;})}</View>:null}<Text className="mt-5 text-sm font-bold">Waktu Mulai</Text><TextInput value={start} onChangeText={setStart} keyboardType="numbers-and-punctuation" className="mt-2 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5"/><Text className="mt-4 text-sm font-bold">Waktu Selesai</Text><TextInput value={end} onChangeText={setEnd} keyboardType="numbers-and-punctuation" className="mt-2 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5"/><Text className="mt-5 text-sm font-bold">Batas terlambat</Text><View className="mt-2 flex-row flex-wrap gap-2">{[10,15,30,60].map(n=><Pressable key={n} onPress={()=>setLate(n)} className={"rounded-full border px-4 py-2.5 "+(late===n?"border-[#3E5219] bg-[#3E5219]":"border-[#C5C8B8] bg-white")}><Text className={"text-xs font-bold "+(late===n?"text-white":"text-[#45483C]")}>{n} menit</Text></Pressable>)}</View><View className="mt-5 flex-row items-center justify-between"><View className="flex-1 pr-4"><Text className="font-bold">Verifikasi lokasi</Text><Text className="mt-1 text-xs text-gray-500">Saat GPS aktif, pusat lokasi QR dipertahankan saat edit kecuali GPS sebelumnya nonaktif.</Text></View><Switch value={gps} onValueChange={setGps}/></View>{gps?<TextInput value={String(radius)} onChangeText={v=>setRadius(Math.max(5,Math.min(3000,Number(v.replace(/\\D/g,""))||5)))} keyboardType="number-pad" className="mt-4 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5"/>:null}</GlassCard>{error?<View className="rounded-2xl bg-red-50 p-4"><Text className="font-semibold text-red-700">{error}</Text></View>:null}<PrimaryButton disabled={busy} onPress={()=>void save()}>{busy?<ActivityIndicator color="#FFF"/>:<ButtonText>Simpan Perubahan</ButtonText>}</PrimaryButton></Screen>;
}

export function OwnerCancelAttendanceWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>(); const router=useRouter(); const [reason,setReason]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const submit=async()=>{setError("");if(!p.attendance_id)return setError("Attendance tidak ditemukan.");if(reason.trim().length<3)return setError("Alasan minimal 3 karakter.");setBusy(true);try{await invokeEdgeFunction("cancel-attendance",{attendance_id:p.attendance_id,reason:reason.trim()});router.replace({pathname:"/screens/history-session",params:{qr_id:p.qr_id||""}});}catch(e){setError(msg(e));}finally{setBusy(false);}};
 return <Screen><BackHeader title="Batalkan Absensi"/><SoftCard><Text className="text-xs font-bold uppercase tracking-[2px] text-red-700">Pemilik QR</Text><Text className="mt-1 text-xl font-black text-gray-950">Batalkan absensi {p.user_name||"Pengguna"}</Text><Text className="mt-2 text-sm leading-5 text-gray-600">Tindakan ini tidak menghapus rekam asli. Keputusan dicatat dalam audit log.</Text></SoftCard><GlassCard><Text className="text-sm font-bold text-gray-900">Alasan pembatalan</Text><TextInput value={reason} onChangeText={setReason} multiline textAlignVertical="top" placeholder="Jelaskan alasan pembatalan…" placeholderTextColor="#8A8D82" className="mt-3 min-h-32 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3.5"/>{error?<View className="mt-3 rounded-2xl bg-red-50 p-3"><Text className="text-sm text-red-700">{error}</Text></View>:null}<PrimaryButton className="mt-4" disabled={busy} onPress={()=>void submit()}>{busy?<ActivityIndicator color="#FFF"/>:<Text className="font-bold text-white">Batalkan Absensi</Text>}</PrimaryButton><SecondaryButton className="mt-3" onPress={()=>router.back()} disabled={busy}><Text className="font-bold text-gray-800">Kembali</Text></SecondaryButton></GlassCard></Screen>;
}
export function SyncWiredScreen(){
 const {user}=useAuth(); const [items,setItems]=useState<AttendanceQueueItem[]>([]); const [busy,setBusy]=useState(false);
 const refresh=async()=>setItems(await getAttendanceQueue());
 const sync=async()=>{if(busy)return;setBusy(true);try{await syncPendingAttendance(user?.id);await refresh();}finally{setBusy(false);}};
 useEffect(()=>{void refresh();},[]);
 return <Screen><BackHeader title="Sinkronisasi"/><PrimaryButton disabled={busy} onPress={()=>void sync()}>{busy?<ActivityIndicator color="#FFF"/>:<ButtonText>Sinkronkan Sekarang</ButtonText>}</PrimaryButton>{items.map(i=><GlassCard key={i.client_event_id}><View className="flex-row justify-between"><Text className="font-black">{i.client_event_id.slice(0,8)}…</Text><Badge tone={i.status==="Tersinkronisasi"?"green":i.status==="Sinkronisasi tertunda"?"red":"yellow"}>{i.status}</Badge></View>{i.last_error?<Text className="mt-2 text-xs text-red-700">{i.last_error}</Text>:null}</GlassCard>)}</Screen>;
}

export function GuideWiredScreen(){return <Screen><BackHeader title="Panduan"/><SoftCard><Text className="text-2xl font-black">Panduan AyoHadir</Text><Text className="mt-2 text-sm text-gray-600">Buat QR, gunakan token server, scan online/offline, sinkronkan, dan cek riwayat.</Text></SoftCard>{[["Pembuatan QR","Isi nama, target, waktu mulai dan selesai. GPS mengambil koordinat aktual."],["Masa berlaku","QR memakai token server dan diperbarui berkala."],["Target pengguna","Target tertentu membutuhkan 1–100 user unik."],["Berbagi QR online","Berbagi online berisiko disalahgunakan; aktifkan GPS bila memungkinkan."],["Scan online/offline","Online divalidasi server. Offline hanya diantrikan bila token masih memiliki expiry."],["Sinkronisasi","Status: Menunggu sinkronisasi, Tersinkronisasi, Sinkronisasi tertunda."],["Riwayat & pembatalan","Bukti memakai data server; pembatalan diproses dengan attendance_id dan alasan."]].map(([a,b])=><GlassCard key={a}><Text className="font-black">{a}</Text><Text className="mt-2 text-sm leading-5 text-gray-600">{b}</Text></GlassCard>)}<View className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><Text className="font-black text-amber-900">Peringatan keamanan</Text><Text className="mt-1 text-sm text-amber-800">{GPS_SHARE_WARNING}</Text></View></Screen>}
