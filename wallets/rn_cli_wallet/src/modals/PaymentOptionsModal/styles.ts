import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionNetwork: {
    fontSize: 12,
    marginTop: 2,
  },
  optionEta: {
    fontSize: 12,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  closeButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  confirmAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  confirmNetwork: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  approveButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  approveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  collectDataScrollView: {
    flexShrink: 1,
  },
  collectDataScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  fieldInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 16,
  },
});
