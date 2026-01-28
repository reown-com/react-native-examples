import { EmptyState } from "@/components/empty-state";
import { FilterTabs } from "@/components/filter-tabs";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useTransactions } from "@/services/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PaymentRecord, TransactionFilterType } from "@/utils/types";
import { showErrorToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

export default function ActivityScreen() {
  const theme = useTheme();
  const { transactionFilter, setTransactionFilter } = useSettingsStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

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
  });

  // Show error toast when fetch fails
  useEffect(() => {
    if (isError && error) {
      showErrorToast(error.message || "Failed to load transactions");
    }
  }, [isError, error]);

  const handleFilterChange = useCallback(
    (filter: TransactionFilterType) => {
      setTransactionFilter(filter);
    },
    [setTransactionFilter],
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

  return (
    <>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <FilterTabs
            selectedFilter={transactionFilter}
            onFilterChange={handleFilterChange}
          />
        }
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
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-4"],
    paddingBottom: Spacing["extra-spacing-2"],
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
  footerLoader: {
    paddingVertical: Spacing["spacing-4"],
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
