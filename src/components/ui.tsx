
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

export const UI = {
  bg: "#FFFFFF",
  soft: "#F8FAFC",
  surface: "#FFFFFF",
  tint: "#F5F5DC",
  text: "#111827",
  muted: "#6B7280",
  faint: "#94A3B8",
  border: "#E5E7EB",
  green: "#10B981",
  greenDark: "#059669",
  greenSoft: "#ECFDF5",
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
  const body = scroll ? (
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={"gap-5 px-5 pb-8 pt-5 " + contentClassName}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={"flex-1 bg-white " + contentClassName}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
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
        "min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3.5 " +
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
      className={"min-h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3.5 " + className}
    >
      {children}
    </Pressable>
  );
}

export function DangerButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-3.5"
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
        <Text className="text-xl font-semibold text-gray-700">‹</Text>
      </Pressable>
      <Text className="flex-1 px-3 text-base font-extrabold text-emerald-700">{title}</Text>
      <View className="min-w-10 items-end">{right}</View>
    </View>
  );
}

type NavKey = "home" | "history" | "qr" | "notifications" | "profile";

export function BottomNav({ active }: { active: NavKey }) {
  const router = useRouter();
  const items: Array<{ key: NavKey; label: string; icon: string; route: string }> = [
    { key: "home", label: "Beranda", icon: "⌂", route: "/" },
    { key: "history", label: "Riwayat", icon: "◷", route: "/history" },
    { key: "qr", label: "QR", icon: "▦", route: "/qr" },
    { key: "notifications", label: "Notifikasi", icon: "•", route: "/notifications" },
    { key: "profile", label: "Profil", icon: "◉", route: "/profile" }
  ];

  return (
    <View className="flex-row items-center justify-around border-t border-gray-100 bg-white px-2 pb-2 pt-2">
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            className={"min-w-[58px] items-center rounded-2xl px-2 py-1.5 " + (selected ? "bg-emerald-50" : "")}
          >
            {item.key === "qr" ? (
              <View className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                <Text className="text-2xl font-black text-white">▦</Text>
              </View>
            ) : (
              <Text className={"text-lg " + (selected ? "text-emerald-600" : "text-gray-400")}>{item.icon}</Text>
            )}
            <Text className={"mt-0.5 text-[10px] font-semibold " + (selected ? "text-emerald-700" : "text-gray-500")}>{item.label}</Text>
          </Pressable>
        );
      })}
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
  return (
    <Pressable onPress={onPress} className="flex-row items-center border-b border-gray-100 px-1 py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
        <Text className="text-lg text-emerald-700">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-900">{title}</Text>
        {subtitle ? <Text className="mt-1 text-xs leading-4 text-gray-500">{subtitle}</Text> : null}
      </View>
      <Text className="ml-3 text-xl font-semibold text-gray-300">{trailing}</Text>
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

export function QrVisual({ size = 236, label = "QR" }: { size?: number; label?: string }) {
  const cells: ReactNode[] = [];
  const n = 21;
  const isFinder = (x: number, y: number, ox: number, oy: number) =>
    x >= ox && x < ox + 7 && y >= oy && y < oy + 7 &&
    (x === ox || x === ox + 6 || y === oy || y === oy + 6 || (x >= ox + 2 && x <= ox + 4 && y >= oy + 2 && y <= oy + 4));

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dark = isFinder(x, y, 0, 0) || isFinder(x, y, 14, 0) || isFinder(x, y, 0, 14) ||
        (x > 7 && y > 7 && ((x * 17 + y * 11 + x * y) % 7 < 3));
      cells.push(<View key={String(x) + "-" + String(y)} className={"h-[9.5px] w-[9.5px] " + (dark ? "bg-gray-900" : "bg-white")} />);
    }
  }

  return (
    <View className="items-center justify-center rounded-2xl border-2 border-emerald-100 bg-white p-3">
      <View style={{ width: size, height: size }} className="flex-row flex-wrap overflow-hidden bg-white">
        {cells}
      </View>
      <Text className="mt-2 text-[10px] font-bold tracking-[2px] text-gray-300">{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <View className="h-full rounded-full bg-emerald-500" style={{ width: String(Math.max(0, Math.min(100, value))) + "%" }} />
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
