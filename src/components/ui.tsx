
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import QRCode from "react-native-qrcode-svg";
import { Circle, Ellipse, G, Path, Rect, Svg } from "react-native-svg";
import { useRouter } from "expo-router";

export function AyoHadirLogo({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 500 500" accessibilityLabel="Logo AyoHadir!">
      <Circle cx="250" cy="250" r="240" fill="#FA6003" />
      <Circle cx="250" cy="250" r="180" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeDasharray="105 45" strokeDashoffset="25" />
      <Circle cx="123" cy="123" r="14" fill="#FFFFFF" />
      <Circle cx="377" cy="123" r="14" fill="#FFFFFF" />
      <Circle cx="123" cy="377" r="14" fill="#FFFFFF" />
      <Circle cx="377" cy="377" r="14" fill="#FFFFFF" />
      <Circle cx="250" cy="245" r="95" fill="none" stroke="#FFFFFF" strokeWidth="16" />
      <Circle cx="250" cy="195" r="32" fill="#FFFFFF" />
      <Path d="M190 285 C190 230 310 230 310 285 Z" fill="#FFFFFF" />
      <Path d="M205 300 L245 340 L320 255" fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M205 300 L245 340 L320 255" fill="none" stroke="#FA6003" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <G transform="translate(250,95)">
        <Circle cx="0" cy="0" r="42" fill="#FA6003" stroke="#FFFFFF" strokeWidth="12" />
        <Path d="M0 -22 V0 L16 16" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <G transform="translate(100,255)">
        <Path d="M-16 -48 H16 V-34 H-16 Z" fill="#FFFFFF" />
        <Path d="M-8 -56 H8 V-46 H-8 Z" fill="#FA6003" />
        <Rect x="-46" y="-34" width="92" height="72" rx="12" fill="#FFFFFF" />
        <Circle cx="-22" cy="-6" r="10" fill="#FA6003" />
        <Path d="M-34 18 C-34 6 -10 6 -10 18 Z" fill="#FA6003" />
        <Rect x="4" y="-12" width="26" height="6" rx="3" fill="#FA6003" />
        <Rect x="4" y="2" width="26" height="6" rx="3" fill="#FA6003" />
      </G>
      <G transform="translate(400,255)">
        <Rect x="-40" y="-68" width="80" height="136" rx="16" fill="#FFFFFF" />
        <Rect x="-12" y="-60" width="24" height="4" rx="2" fill="#FA6003" />
        <Rect x="-26" y="-36" width="20" height="20" fill="none" stroke="#FA6003" strokeWidth="4" />
        <Rect x="-22" y="-32" width="12" height="12" fill="#FA6003" />
        <Rect x="6" y="-36" width="20" height="20" fill="none" stroke="#FA6003" strokeWidth="4" />
        <Rect x="10" y="-32" width="12" height="12" fill="#FA6003" />
        <Rect x="-26" y="-4" width="20" height="20" fill="none" stroke="#FA6003" strokeWidth="4" />
        <Rect x="-22" y="0" width="12" height="12" fill="#FA6003" />
        <Rect x="6" y="-4" width="6" height="6" fill="#FA6003" />
        <Rect x="18" y="-4" width="8" height="6" fill="#FA6003" />
        <Rect x="6" y="8" width="10" height="8" fill="#FA6003" />
        <Rect x="20" y="10" width="6" height="6" fill="#FA6003" />
        <Path d="M-32 -42 H-36 V-38 M32 -42 H36 V-38 M-32 26 H-36 V22 M32 26 H36 V22" fill="none" stroke="#FA6003" strokeWidth="3" strokeLinecap="round" />
      </G>
      <G transform="translate(250,410)">
        <Ellipse cx="0" cy="30" rx="36" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        <Path d="M0 24 C-26 0 -30 -20 -30 -34 C-30 -52 -16 -66 0 -66 C16 -66 30 -52 30 -34 C30 -20 26 0 0 24 Z" fill="#FFFFFF" />
        <Circle cx="0" cy="-34" r="13" fill="#FA6003" />
      </G>
    </Svg>
  );
}

export type AppIconName =
  | "home"
  | "history"
  | "qr"
  | "qr_code_scanner"
  | "qr_code_2"
  | "notifications"
  | "notifications_active"
  | "person"
  | "settings"
  | "arrow_back"
  | "close"
  | "share"
  | "download"
  | "edit"
  | "delete"
  | "location_on"
  | "camera_alt"
  | "flash_on"
  | "keyboard"
  | "check_circle"
  | "error"
  | "sync"
  | "logout"
  | "help"
  | "info"
  | "description"
  | "tune"
  | "devices"
  | "schedule"
  | "timer"
  | "analytics"
  | "trending_up"
  | "cloud_done"
  | "assignment_late"
  | "lock_clock"
  | "verified"
  | "account_circle"
  | "more_vert"
  | "chevron_right"
  | "person_add"
  | "photo_camera";

const APP_ICON_IOS: Record<AppIconName, string> = {
  home: "house",
  history: "clock.arrow.circlepath",
  qr: "qrcode",
  notifications: "bell",
  person: "person",
  settings: "gearshape",
  arrow_back: "chevron.left",
  close: "xmark",
  share: "square.and.arrow.up",
  download: "arrow.down.circle",
  edit: "pencil",
  delete: "trash",
  location_on: "location",
  camera_alt: "camera",
  flash_on: "bolt.fill",
  keyboard: "keyboard",
  check_circle: "checkmark.circle.fill",
  error: "exclamationmark.circle.fill",
  sync: "arrow.triangle.2.circlepath",
  logout: "rectangle.portrait.and.arrow.right",
  help: "questionmark.circle",
  info: "info.circle",
  description: "doc.text",
  tune: "slider.horizontal.3",
  devices: "iphone",
  schedule: "clock",
  more_vert: "ellipsis",
  chevron_right: "chevron.right",
  person_add: "person.badge.plus",
  photo_camera: "camera.circle",
  qr_code_scanner: "qrcode.viewfinder",
  qr_code_2: "qrcode",
  notifications_active: "bell.badge",
  timer: "timer",
  analytics: "chart.bar",
  trending_up: "chart.line.uptrend.xyaxis",
  cloud_done: "checkmark.icloud",
  assignment_late: "doc.badge.ellipsis",
  lock_clock: "lock",
  verified: "checkmark.seal",
  account_circle: "person.crop.circle"
};

const APP_ICON_ANDROID: Record<AppIconName, string> = {
  home: "home",
  history: "history",
  qr: "qr_code_2",
  qr_code_scanner: "qr_code_scanner",
  qr_code_2: "qr_code_2",
  notifications: "notifications",
  notifications_active: "notifications_active",
  person: "person",
  settings: "settings",
  arrow_back: "arrow_back",
  close: "close",
  share: "share",
  download: "download",
  edit: "edit",
  delete: "delete",
  location_on: "location_on",
  camera_alt: "camera_alt",
  flash_on: "flash_on",
  keyboard: "keyboard",
  check_circle: "check_circle",
  error: "error",
  sync: "sync",
  logout: "logout",
  help: "help",
  info: "info",
  description: "description",
  tune: "tune",
  devices: "devices",
  schedule: "schedule",
  timer: "timer",
  analytics: "analytics",
  trending_up: "trending_up",
  cloud_done: "cloud_done",
  assignment_late: "assignment_late",
  lock_clock: "lock_clock",
  verified: "verified",
  account_circle: "account_circle",
  more_vert: "more_vert",
  chevron_right: "chevron_right",
  person_add: "person_add",
  photo_camera: "photo_camera"
};

export function AppIcon({
  name,
  size = 22,
  color = UI.greenDark
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  return (
    <SymbolView
      name={{
        ios: APP_ICON_IOS[name] as never,
        android: APP_ICON_ANDROID[name] as never,
        web: APP_ICON_ANDROID[name] as never
      }}
      size={size}
      tintColor={color}
      type="monochrome"
      fallback={<View style={{ width: size, height: size }} />}
    />
  );
}

export const UI = {
  bg: "#FAF9F6",
  soft: "#F4F3F1",
  surface: "#FFFFFF",
  tint: "#F5F5DC",
  text: "#1A1C1A",
  muted: "#45483C",
  faint: "#75796B",
  border: "#C5C8B8",
  green: "#3E5219",
  greenDark: "#3E5219",
  greenSoft: "#BFEFBE",
  yellow: "#F59E0B",
  yellowSoft: "#FFFBEB",
  red: "#EF4444",
  redSoft: "#FEF2F2"
} as const;

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentClassName?: string;
  bottomNav?: "home" | "history" | "qr" | "notifications" | "profile" | null;
}>;

export function Screen({ children, scroll = true, contentClassName = "", bottomNav = null }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      className="flex-1 bg-[#FAF9F6]"
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={"gap-5 px-5 pt-5 " + contentClassName}
      contentContainerStyle={{
        paddingBottom: bottomNav ? insets.bottom + 96 : insets.bottom + 32
      }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={"flex-1 bg-[#FAF9F6] " + contentClassName}
      style={{ paddingBottom: bottomNav ? 0 : insets.bottom }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF9F6]"
      edges={bottomNav ? ["top"] : ["top", "bottom"]}
    >
      {body}
      {bottomNav ? <BottomNav active={bottomNav} /> : null}
    </SafeAreaView>
  );
}

export function GlassCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <View className={"rounded-xl border border-[#C5C8B8]/35 bg-white p-5 " + className}>
      {children}
    </View>
  );
}

export function SoftCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <View className={"rounded-xl border border-[#3E5219]/10 bg-[#F5F5DC] p-5 " + className}>
      {children}
    </View>
  );
}

export function Badge({
  children,
  tone = "green"
}: PropsWithChildren<{ tone?: "green" | "yellow" | "red" | "gray" | "dark" }>) {
  const box = {
    green: "bg-[#E4F1D2]",
    yellow: "bg-[#FFF4D6]",
    red: "bg-[#FDECEC]",
    gray: "bg-gray-100",
    dark: "bg-[#3E5219]"
  }[tone];
  const text = {
    green: "text-[#3E5219]",
    yellow: "text-[#8A5A00]",
    red: "text-[#BA1A1A]",
    gray: "text-[#45483C]",
    dark: "text-white"
  }[tone];
  return (
    <View className={"self-start rounded-full px-3 py-1.5 " + box}>
      <Text className={"text-xs font-bold " + text}>{children}</Text>
    </View>
  );
}

export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  className = ""
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={
        "min-h-12 items-center justify-center rounded-lg bg-[#3E5219] px-5 py-3.5 " +
        (disabled ? "opacity-50 " : "") +
        className
      }
    >
      {children}
    </Pressable>
  );
}

export function SecondaryButton({
  children,
  onPress,
  className = ""
}: {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={"min-h-12 items-center justify-center rounded-lg border border-[#75796B] bg-white px-5 py-3.5 " + className}
    >
      {children}
    </Pressable>
  );
}

export function DangerButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5"
    >
      {children}
    </Pressable>
  );
}

export function ButtonText({ children, dark = false }: PropsWithChildren<{ dark?: boolean }>) {
  return <Text className={"text-sm font-bold " + (dark ? "text-gray-900" : "text-white")}>{children}</Text>;
}

export function BackHeader({
  title,
  right
}: {
  title: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between border-b border-[#DDE8C9]/70 bg-white px-4 py-3">
      <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
        <AppIcon name="arrow_back" size={22} color={UI.text} />
      </Pressable>
      <Text className="flex-1 px-3 text-base font-extrabold text-[#3E5219]">{title}</Text>
      <View className="min-w-10 items-end">{right}</View>
    </View>
  );
}

type NavKey = "home" | "history" | "qr" | "notifications" | "profile";

export function BottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items: Array<{ key: NavKey; label: string; icon: AppIconName; route: string }> = [
    { key: "home", label: "Beranda", icon: "home", route: "/" },
    { key: "history", label: "Riwayat", icon: "history", route: "/history" },
    { key: "qr", label: "QR", icon: "qr_code_scanner", route: "/qr" },
    { key: "notifications", label: "Notifikasi", icon: "notifications", route: "/notifications" },
    { key: "profile", label: "Profil", icon: "person", route: "/profile" }
  ];

  return (
    <View
      className="border-t border-[#C5C8B8]/30 bg-[#FAF9F6]"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-center justify-around px-3 pt-2">
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as any)}
              className="min-w-[60px] items-center px-2 pb-1"
            >
              {item.key === "qr" ? (
                <View className="-mt-7 h-14 w-14 items-center justify-center rounded-full bg-[#3E5219] shadow-md">
                  <AppIcon name="qr" size={26} color="#FFFFFF" />
                </View>
              ) : (
                <View className={selected ? "h-9 w-14 items-center justify-center rounded-full bg-[#E4F1D2]" : "h-9 w-14 items-center justify-center"}>
                  <AppIcon
                    name={item.icon}
                    size={23}
                    color={selected ? UI.greenDark : UI.faint}
                  />
                </View>
              )}
              <Text className={"mt-1 text-[10px] font-semibold " + (selected ? "text-[#3E5219]" : "text-gray-500")}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="flex-row items-end justify-between border-b border-gray-100 pb-2">
      <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
      {action}
    </View>
  );
}

const ICON_ALIASES: Record<string, AppIconName> = {
  "person": "person",
  "▣": "devices",
  "↪": "logout",
  "⌖": "location_on",
  "☼": "tune",
  "🔒": "settings",
  "?": "help",
  "i": "info",
  "§": "description",
  "✎": "edit",
  "✓": "check_circle",
  "↶": "history",
  "◷": "schedule",
  "⌗": "qr",
  "▦": "qr",
  "⚙": "settings",
  "◉": "person",
  "×": "close",
  "↻": "sync"
};

export function RowButton({
  icon,
  title,
  subtitle,
  onPress,
  trailing = "›"
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: string;
}) {
  const iconName = ICON_ALIASES[icon] ?? "info";
  const trailingIcon = trailing === "›" ? "chevron_right" : null;

  return (
    <Pressable onPress={onPress} className="flex-row items-center border-b border-gray-100 px-1 py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F2F5E8]">
        <AppIcon name={iconName} size={19} color={UI.greenDark} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-900">{title}</Text>
        {subtitle ? <Text className="mt-1 text-xs leading-4 text-gray-500">{subtitle}</Text> : null}
      </View>
      {trailingIcon ? (
        <AppIcon name={trailingIcon} size={19} color="#CBD5E1" />
      ) : (
        <Text className="ml-3 text-sm text-gray-400">{trailing}</Text>
      )}
    </Pressable>
  );
}

export function StatCard({ label, value, delta, tone = "green" }: { label: string; value: string; delta?: string; tone?: "green" | "yellow" }) {
  return (
    <GlassCard className="flex-1 p-4">
      <Text className="text-xs font-semibold text-gray-500">{label}</Text>
      <Text className={"mt-2 text-3xl font-black " + (tone === "green" ? "text-[#3E5219]" : "text-amber-600")}>{value}</Text>
      {delta ? <Text className="mt-1 text-[11px] font-semibold text-gray-500">{delta}</Text> : null}
    </GlassCard>
  );
}

export function Segmented({
  items,
  value,
  onChange
}: {
  items: string[];
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <View className="flex-row rounded-lg border border-[#C5C8B8]/30 bg-[#F4F3F1] p-1">
      {items.map((item) => {
        const selected = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange?.(item)}
            className={"flex-1 items-center rounded-md px-3 py-3 " + (selected ? "bg-white shadow-sm" : "")}
          >
            <Text className={"text-xs font-bold " + (selected ? "text-gray-900" : "text-gray-500")}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QrVisual({
  size = 236,
  label = "QR",
  value = "ayohadir:demo-session-token"
}: {
  size?: number;
  label?: string;
  value?: string;
}) {
  return (
    <View className="items-center justify-center rounded-xl border-2 border-[#DDE8C9] bg-white p-3">
      <QRCode
        value={value}
        size={size}
        backgroundColor="#FFFFFF"
        color="#111827"
        quietZone={4}
        ecl="M"
      />
      <Text className="mt-2 text-[10px] font-bold tracking-[2px] text-gray-300">{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <View className="h-full rounded-full bg-[#F2F5E8]0" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </View>
  );
}

export function MiniCalendar({ date = "15 Agustus 2024" }: { date?: string }) {
  return (
    <View className="flex-row items-center rounded-2xl bg-gray-50 px-4 py-3">
      <Text className="mr-3 text-lg text-[#3E5219]">▣</Text>
      <Text className="text-sm font-semibold text-gray-700">{date}</Text>
    </View>
  );
}

export function OfflineBanner({ text = "Offline — data akan disinkronkan saat koneksi kembali." }: { text?: string }) {
  return (
    <View className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
      <Text className="text-xs font-semibold leading-5 text-amber-800">{text}</Text>
    </View>
  );
}
