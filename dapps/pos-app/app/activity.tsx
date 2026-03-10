import { EmptyState } from "@/components/empty-state";
import { FilterButtons } from "@/components/filter-buttons";
import { RadioList, RadioOption } from "@/components/radio-list";
import { SettingsBottomSheet } from "@/components/settings-bottom-sheet";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useTransactions } from "@/services/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  DateRangeFilterType,
  PaymentRecord,
  TransactionFilterType,
} from "@/utils/types";
import { showErrorToast } from "@/utils/toast";
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

const DATE_RANGE_OPTIONS: { value: DateRangeFilterType; label: string }[] = [
  { value: "all_time", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7_days", label: "7 Days" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
];

const STATUS_LABELS: Record<TransactionFilterType, string> = {
  all: "Status",
  failed: "Failed",
  pending: "Pending",
  completed: "Completed",
};

const DATE_RANGE_LABELS: Record<DateRangeFilterType, string> = {
  all_time: "Date range",
  today: "Today",
  "7_days": "7 Days",
  this_week: "This Week",
  this_month: "This Month",
};

export default function ActivityScreen() {
  const theme = useTheme();
  const {
    transactionFilter,
    setTransactionFilter,
    dateRangeFilter,
    setDateRangeFilter,
  } = useSettingsStore();
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
      { value: "failed", label: "Failed", dotColor: theme["icon-error"] },
      {
        value: "pending",
        label: "Pending",
        dotColor: theme["icon-default"],
      },
      {
        value: "completed",
        label: "Completed",
        dotColor: theme["icon-success"],
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

  // Show error toast when fetch fails
  useEffect(() => {
    if (isError && error) {
      showErrorToast(error.message || "Failed to load transactions");
    }
  }, [isError, error]);

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

  const keyExtractor = useCallback(
    (item: PaymentRecord) => item.payment_id,
    [],
  );

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

    return (
      <EmptyState
        title="No activity yet"
        subtitle="Your transaction history will appear here"
      />
    );
  }, [isLoading, theme]);

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

  const listHeader = useMemo(
    () => (
      <FilterButtons
        statusLabel={STATUS_LABELS[transactionFilter]}
        dateRangeLabel={DATE_RANGE_LABELS[dateRangeFilter]}
        onStatusPress={() => setActiveSheet("status")}
        onDateRangePress={() => setActiveSheet("dateRange")}
      />
    ),
    [transactionFilter, dateRangeFilter],
  );

  return (
    <>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          (!transactions || transactions?.length === 0) &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={false}
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
        title="Date Range"
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
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: Spacing["spacing-4"],
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
  footerLoader: {
    paddingVertical: Spacing["spacing-4"],
    alignItems: "center",
  },
});
