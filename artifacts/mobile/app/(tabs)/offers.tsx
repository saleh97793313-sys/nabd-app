import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAppContext } from "@/context/AppContext";
import { OfferCard } from "@/components/OfferCard";

const CATEGORIES = ["الكل", "أسنان", "علاج طبيعي", "جلدية", "تحاليل", "طب عام"];

export default function OffersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { offers, offersLoading } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered = offers.filter((o) => {
    const matchesCategory =
      selectedCategory === "الكل" || o.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      o.title.includes(searchQuery) ||
      o.clinicName.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          العروض الصحية
        </Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          وفّر على صحتك واكسب نقاط
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.backgroundCard },
          ]}
        >
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              { color: colors.text, textAlign: "right" },
            ]}
            placeholder="ابحث عن عرض أو عيادة..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <FlatList
          data={CATEGORIES}
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === item
                      ? colors.tint
                      : colors.backgroundCard,
                  borderColor:
                    selectedCategory === item ? colors.tint : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === item ? "#fff" : colors.textSecondary,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {offersLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            جاري تحميل العروض...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 100 : 100 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OfferCard
              offer={item}
              colors={colors}
              onPress={() => router.push(`/offer/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="tag" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                لا توجد عروض في هذه الفئة
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  categoryList: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
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
