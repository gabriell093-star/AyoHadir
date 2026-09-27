
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";

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
        ios: APP_ICON_IOS[name],
        android: APP_ICON_ANDROID[name],
        web: APP_ICON_ANDROID[name]
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
  greenSoft: "#BF EFBE".replace(" ", ""),
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
      className="flex-1 bg-white"
      edges={bottomNav ? ["top"] : ["top", "bottom"]}
    >
      {body}
      {bottomNav ? <BottomNav active={bottomNav} /> : null}
    </SafeAreaView>
  );
}

export function GlassCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <View className={"rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm " + className}>
      {children}
    </View>
  );
}

export function SoftCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <View className={"rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-5 " + className}>
      {children}
    </View>
  );
}

export function Badge({
  children,
  tone = "green"
}: PropsWithChildren<{ tone?: "green" | "yellow" | "red" | "gray" | "dark" }>) {
  const box = {
    green: "bg-emerald-50",
    yellow: "bg-amber-50",
    red: "bg-red-50",
    gray: "bg-gray-100",
    dark: "bg-gray-900"
  }[tone];
  const text = {
    green: "text-emerald-700",
    yellow: "text-amber-700",
    red: "text-red-700",
    gray: "text-gray-600",
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
        "min-h-12 items-center justify-center rounded-2xl bg-[#3E5219] px-5 py-3.5 " +
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
      className={"min-h-12 items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3.5 " + className}
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
    <View className="flex-row items-center justify-between border-b border-emerald-100/70 bg-white px-4 py-3">
      <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
        <AppIcon name="arrow_back" size={22} color={UI.text} />
      </Pressable>
      <Text className="flex-1 px-3 text-base font-extrabold text-emerald-700">{title}</Text>
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
      className="border-t border-gray-200 bg-white"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-center justify-around px-2 pt-2">
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as any)}
              className="min-w-[60px] items-center px-2 pb-1"
            >
              {item.key === "qr" ? (
                <View className="-mt-7 h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                  <AppIcon name="qr" size={26} color="#FFFFFF" />
                </View>
              ) : (
                <View className={selected ? "h-9 w-14 items-center justify-center rounded-full bg-emerald-50" : "h-9 w-14 items-center justify-center"}>
                  <AppIcon
                    name={item.icon}
                    size={23}
                    color={selected ? UI.greenDark : UI.faint}
                  />
                </View>
              )}
              <Text className={"mt-1 text-[10px] font-semibold " + (selected ? "text-emerald-700" : "text-gray-500")}>
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
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
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
      <Text className={"mt-2 text-3xl font-black " + (tone === "green" ? "text-emerald-600" : "text-amber-600")}>{value}</Text>
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
    <View className="flex-row rounded-2xl border border-gray-100 bg-gray-50 p-1">
      {items.map((item) => {
        const selected = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange?.(item)}
            className={"flex-1 items-center rounded-xl px-3 py-3 " + (selected ? "bg-white shadow-sm" : "")}
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
    <View className="items-center justify-center rounded-xl border-2 border-emerald-100 bg-white p-3">
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
      <View className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </View>
  );
}

export function MiniCalendar({ date = "15 Agustus 2024" }: { date?: string }) {
  return (
    <View className="flex-row items-center rounded-2xl bg-gray-50 px-4 py-3">
      <Text className="mr-3 text-lg text-emerald-600">▣</Text>
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
