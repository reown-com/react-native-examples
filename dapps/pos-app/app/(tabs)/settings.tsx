import { StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';
import { networks } from '@/utils/appkit';
import { useAccount, useAppKit } from '@reown/appkit-react-native';

// Network mapping for display names
const getNetworkName = (chainId: string) => {
  const network = networks.find(n => String(n.id) === String(chainId));
  return network?.name;
};

const formatAccounts = (accounts: any[]) => {
  return accounts.map(account => ({
    address: account.address,
    namespace: account.namespace,
    chainId: account.chainId,
    networkName: getNetworkName(account.chainId),
  })).filter(account => account.networkName);
};

export default function Settings() {
  const Theme = useTheme();
  const { allAccounts } = useAccount();
  const {open} = useAppKit();

  const groupedAccounts = allAccounts ? formatAccounts(allAccounts) : [];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Settings
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.accountsContainer}>
        <ThemedText type="subtitle" style={styles.label}>
          Select Recipient Address
        </ThemedText>
        
        
          {groupedAccounts.map((account) => (
            <ThemedView key={account.chainId} style={styles.networkGroup}>
              <ThemedText style={[styles.networkName, { color: Theme.primary }]}>
                {account.networkName}
              </ThemedText>
                <ThemedView
                  key={`${account.address}-${account.chainId}`}
                  style={[ styles.accountItem, { backgroundColor: Theme.background, borderColor: Theme.border }]}
                >
                  <ThemedText 
                    style={[
                      styles.accountAddress,
                      {  color: Theme.text }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {account.address}
                  </ThemedText>
                </ThemedView>
            </ThemedView>
          ))}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.openButton, { backgroundColor: Theme.primary }
          ]}
          onPress={() => open()}
        >
          <ThemedText style={styles.openButtonText}>Open AppKit</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  accountsContainer: {
    marginTop: 20,
    padding: 16,
    flex: 1,
  },
  label: {
    marginBottom: 16,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  networkGroup: {
    marginBottom: 20,
  },
  networkName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  accountItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  accountAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  openButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});