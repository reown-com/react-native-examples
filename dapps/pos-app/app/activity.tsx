import { EmptyState } from "@/components/empty-state";
import { FilterButtons } from "@/components/filter-buttons";
import { RadioList, RadioOption } from "@/components/radio-list";
import { SettingsBottomSheet } from "@/components/settings-bottom-sheet";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { Spacing } from "@/constants/spacing";
import { DATE_RANGE_OPTIONS } from "@/utils/date-range";
import { useTheme } from "@/hooks/use-theme-color";
import { useTransactions } from "@/services/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  DateRangeFilterType,
  PaymentRecord,
  TransactionFilterType,
} from "@/utils/types";
import { showErrorToast } from "@/utils/toast";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

type ActiveSheet = "status" | "dateRange" | null;

const STATUS_LABELS: Record<TransactionFilterType, string> = {
  all: "Status",
  pending: "Pending",
  completed: "Confirmed",
  failed: "Failed",
  expired: "Expired",
  cancelled: "Cancelled",
};

const DATE_RANGE_LABELS: Record<DateRangeFilterType, string> = {
  all_time: "Date range",
  today: "Today",
  "7_days": "7 days",
  this_week: "This week",
  this_month: "This month",
};

export default function ActivityScreen() {
  const theme = useTheme();
  const transactionFilter = useSettingsStore(
    (state) => state.transactionFilter,
  );
  const setTransactionFilter = useSettingsStore(
    (state) => state.setTransactionFilter,
  );
  const dateRangeFilter = useSettingsStore((state) => state.dateRangeFilter);
  const setDateRangeFilter = useSettingsStore(
    (state) => state.setDateRangeFilter,
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const statusOptions: RadioOption<TransactionFilterType>[] = useMemo(
    () => [
      {
        value: "all",
        label: "All",
        dotColor: theme["icon-accent-primary"],
      },
      {
        value: "pending",
        label: "Pending",
        dotColor: theme["bg-invert"],
      },
      {
        value: "completed",
        label: "Confirmed",
        dotColor: theme["icon-success"],
      },
      { value: "failed", label: "Failed", dotColor: theme["icon-error"] },
      { value: "expired", label: "Expired", dotColor: theme["icon-warning"] },
      {
        value: "cancelled",
        label: "Cancelled",
        dotColor: theme["icon-default"],
      },
    ],
    [theme],
  );

  const {
    transactions,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions({
    filter: transactionFilter,
    dateRangeFilter,
  });

  const isEmpty = !transactions || transactions.length === 0;

  // An initial failure replaces the list with an error state. If data is
  // already visible, retain it and give the merchant lightweight feedback.
  useEffect(() => {
    if (isError && error && !isEmpty) {
      showErrorToast(
        "We couldn't refresh payments. Check your internet connection and try again.",
      );
    }
  }, [isError, error, isEmpty]);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const handleStatusChange = useCallback(
    (filter: TransactionFilterType) => {
      setTransactionFilter(filter);
      setActiveSheet(null);
    },
    [setTransactionFilter],
  );

  const handleDateRangeChange = useCallback(
    (filter: DateRangeFilterType) => {
      setDateRangeFilter(filter);
      setActiveSheet(null);
    },
    [setDateRangeFilter],
  );

  const handleTransactionPress = useCallback((payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedPayment(null);
  }, []);

  const filtersActive =
    transactionFilter !== "all" || dateRangeFilter !== "all_time";

  const handleClearFilters = useCallback(() => {
    setTransactionFilter("all");
    setDateRangeFilter("all_time");
  }, [setTransactionFilter, setDateRangeFilter]);

  const renderItem = useCallback(
    ({ item }: { item: PaymentRecord }) => (
      <TransactionCard
        payment={item}
        onPress={() => handleTransactionPress(item)}
        style={styles.cardPadding}
      />
    ),
    [handleTransactionPress],
  );

  const keyExtractor = useCallback((item: PaymentRecord) => item.paymentId, []);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme["icon-accent-primary"]}
          />
        </View>
      );
    }

    if (isError) {
      return (
        <EmptyState
          title="We couldn't load payments"
          subtitle="Check your internet connection and try again."
          cta={{ label: "Try again", onPress: refetch }}
        />
      );
    }

    if (filtersActive) {
      return (
        <EmptyState
          title="No payments found"
          subtitle="No payments match the filters you selected."
          cta={{ label: "Clear filters", onPress: handleClearFilters }}
        />
      );
    }

    return (
      <EmptyState
        title="No payments yet"
        subtitle="Your payments will show up here once you start taking them."
        cta={{
          label: "Start payment",
          onPress: () => router.push("/amount"),
        }}
      />
    );
  }, [isLoading, isError, theme, filtersActive, handleClearFilters, refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme["icon-accent-primary"]} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  return (
    <View style={styles.container}>
      <FilterButtons
        buttons={[
          {
            label: STATUS_LABELS[transactionFilter],
            onPress: () => setActiveSheet("status"),
          },
          {
            label: DATE_RANGE_LABELS[dateRangeFilter],
            onPress: () => setActiveSheet("dateRange"),
          },
        ]}
      />
      <View
        style={[styles.divider, { backgroundColor: theme["border-primary"] }]}
      />
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          isEmpty && styles.emptyListContent,
        ]}
        scrollEnabled={!isEmpty}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme["icon-accent-primary"]}
          />
        }
      />

      <SettingsBottomSheet
        visible={activeSheet === "status"}
        title="Status"
        onClose={closeSheet}
      >
        <RadioList
          options={statusOptions}
          value={transactionFilter}
          onChange={handleStatusChange}
        />
      </SettingsBottomSheet>

      <SettingsBottomSheet
        visible={activeSheet === "dateRange"}
        title="Date range"
        onClose={closeSheet}
      >
        <RadioList
          options={DATE_RANGE_OPTIONS}
          value={dateRangeFilter}
          onChange={handleDateRangeChange}
        />
      </SettingsBottomSheet>

      <TransactionDetailModal
        visible={modalVisible}
        payment={selectedPayment}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing["spacing-4"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-6"],
    gap: Spacing["spacing-2"],
  },
  emptyListContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPadding: {
    marginHorizontal: Spacing["spacing-5"],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing["spacing-5"],
    marginTop: Spacing["spacing-1"],
    marginBottom: Spacing["spacing-3"],
  },
  footerLoader: {
    paddingVertical: Spacing["spacing-4"],
    alignItems: "center",
  },
});
