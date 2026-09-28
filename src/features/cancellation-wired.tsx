/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, View } from "react-native";
import { useAuth } from "@/auth/auth-context";
import { invokeEdgeFunction } from "@/lib/backend";
import { supabase } from "@/lib/supabase";
import { BackHeader, Badge, GlassCard, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { useLocalSearchParams, useRouter } from "expo-router";

const REQUEST_ERROR = "Pengajuan tidak dapat diproses. Coba lagi.";
const REVIEW_ERROR = "Permintaan tidak dapat ditinjau. Coba lagi.";

export function CancellationRequestWiredScreen(){
 const p=useLocalSearchParams<Record<string,string>>();
 const {user}=useAuth();
 const router=useRouter();
 const [reason,setReason]=useState("");
 const [busy,setBusy]=useState(false);

 const submit=async()=>{
  const cleaned=reason.trim();
  if(!user?.id||!p.attendance_id){
   Alert.alert("Pembatalan","Data absensi tidak tersedia.");
   return;
  }
  if(cleaned.length<3||cleaned.length>1000){
   Alert.alert("Pembatalan","Alasan harus berisi 3 sampai 1000 karakter.");
   return;
  }
  setBusy(true);
  try{
   const {error}=await supabase.from("cancellation_requests").insert({
    attendance_id:p.attendance_id,
    requester_id:user.id,
    reason:cleaned
   });
   if(error) throw error;
   router.replace({pathname:"/screens/cancellation-submitted",params:{attendance_id:p.attendance_id}});
  }catch{
   Alert.alert("Pembatalan",REQUEST_ERROR);
  }finally{setBusy(false);}
 };

 return <Screen>
  <BackHeader title="Ajukan Pembatalan"/>
  <GlassCard>
   <Text className="font-black">Attendance {p.attendance_id||"-"}</Text>
   <Text className="mt-2 text-xs leading-5 text-gray-500">Pengajuan tidak menghapus catatan absensi asli. Pemilik QR akan meninjau alasan Anda.</Text>
   <TextInput value={reason} onChangeText={setReason} multiline maxLength={1000} placeholder="Jelaskan alasan pembatalan" className="mt-4 min-h-28 rounded-2xl border border-[#C5C8B8] bg-white px-4 py-3" textAlignVertical="top"/>
   <Text className="mt-2 text-right text-xs text-gray-400">{reason.length}/1000</Text>
   <PrimaryButton className="mt-4" disabled={busy} onPress={()=>void submit()}>{busy?<ActivityIndicator color="#FFF"/>:<Text className="font-bold text-white">Ajukan Pembatalan</Text>}</PrimaryButton>
   <SecondaryButton className="mt-3" onPress={()=>router.back()} disabled={busy}><Text className="font-bold text-gray-800">Batal</Text></SecondaryButton>
  </GlassCard>
 </Screen>;
}

export function CancellationReviewWiredScreen(){
 const {user}=useAuth();
 const [items,setItems]=useState<any[]>([]);
 const [busy,setBusy]=useState(false);
 const load=async()=>{
  if(!user?.id)return;
  const {data}=await supabase.rpc("get_owner_cancellation_requests",{p_limit:100,p_offset:0});
  setItems(data||[]);
 };
 useEffect(()=>{void load();},[user?.id]);
 const review=async(id:string,decision:"approved"|"rejected")=>{
  if(busy)return;
  setBusy(true);
  try{await invokeEdgeFunction("review-cancellation",{request_id:id,decision});await load();}
  catch{Alert.alert("Review",REVIEW_ERROR);}
  finally{setBusy(false);}
 };
 return <Screen>
  <BackHeader title="Review Pembatalan"/>
  {items.length?items.map(x=><GlassCard key={x.id}>
   <View className="flex-row justify-between">
    <View className="flex-1">
     <Text className="font-black">{x.qr_name||"Sesi QR"}</Text>
     <Text className="mt-1 text-xs text-gray-500">{x.requester_name||"Pengguna"} · {x.attendance_id}</Text>
    </View>
    <Badge tone={x.status==="approved"?"green":x.status==="rejected"?"red":"yellow"}>{x.status||"pending"}</Badge>
   </View>
   <Text className="mt-2 text-sm text-gray-600">{x.reason}</Text>
   {(!x.status||x.status==="pending")?<View className="mt-4 flex-row gap-3">
    <SecondaryButton className="flex-1" onPress={()=>void review(x.id,"rejected")} disabled={busy}><Text className="font-bold text-red-700">Tolak</Text></SecondaryButton>
    <PrimaryButton className="flex-1" onPress={()=>void review(x.id,"approved")} disabled={busy}><Text className="font-bold text-white">Setujui</Text></PrimaryButton>
   </View>:null}
  </GlassCard>):<GlassCard><Text className="font-bold">Tidak ada permintaan pembatalan.</Text></GlassCard>}
 </Screen>;
}
