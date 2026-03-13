import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext, Notification } from "@/context/AppContext";

const NOTIF_CONFIG = {
  points: { icon: "star", color: "#FFB800", bg: "#FFF8E1" },
  offer: { icon: "tag", color: "#00C896", bg: "#E6FBF5" },
  appointment: { icon: "calendar", color: "#1A3A5C", bg: "#EBF4FF" },
  level_up: { icon: "award", color: "#CD7F32", bg: "#FDF3E7" },
};

function NotifItem({
  notif,
  colors,
  onPress,
}: {
  notif: Notification;
  colors: any;
  onPress: () => void;
}) {
  const config = NOTIF_CONFIG[notif.type];
  const date = new Date(notif.createdAt);
  const timeStr = date.toLocaleDateString("ar-OM", {
    day: "numeric",
    month: "short",
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notifCard,
        {
          backgroundColor: notif.isRead
            ? colors.backgroundCard
            : colors.tint + "08",
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <Feather name={config.icon as any} size={20} color={config.color} />
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          {!notif.isRead && (
            <View
              style={[styles.unreadDot, { backgroundColor: colors.tint }]}
            />
          )}
          <Text style={[styles.timeText, { color: colors.textMuted }]}>
            {timeStr}
          </Text>
        </View>
        <Text style={[styles.notifTitle, { color: colors.text }]}>
          {notif.title}
        </Text>
        <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
          {notif.message}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead } = useAppContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.backgroundCard }]}
        >
          <Feather name="chevron-right" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          الإشعارات
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 },
        ]}
        renderItem={({ item }) => (
          <NotifItem
            notif={item}
            colors={colors}
            onPress={() => markNotificationRead(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد إشعارات
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  notifCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row-reverse",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  notifTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  notifMessage: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 19,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});
