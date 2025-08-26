import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { reownGray } from '@/constants/Colors';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: reownGray, dark: reownGray }}
      headerImage={
        <Image
          source={require('@/assets/images/explore-appkit.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">AppKit</ThemedText>
      </ThemedView>
      <ThemedText>Discover the powerful features of AppKit for React Native development.</ThemedText>
      
      <Collapsible title="What is AppKit?">
        <ThemedText>
          AppKit is a comprehensive React Native SDK that provides seamless wallet connectivity and 
          blockchain interactions. It supports both Wagmi and Ethers libraries, making it flexible 
          for different development preferences.
        </ThemedText>
        <ThemedText>
          With AppKit, you can easily integrate 430+ wallets into your React Native app using the 
          WalletConnect protocol, providing users with a familiar and secure connection experience.
        </ThemedText>
        <ExternalLink href="https://docs.reown.com/appkit/react-native/">
          <ThemedText type="link">View Documentation</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Core Features">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Multi-Wallet Support:</ThemedText> Connect to 430+ wallets 
          including MetaMask, Trust Wallet, Rainbow, and more.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Cross-Platform:</ThemedText> Works seamlessly on iOS, 
          Android, and web platforms with consistent behavior.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Multiple Chains:</ThemedText> Support for Ethereum, 
          Polygon, Arbitrum, and other popular blockchain networks.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">WalletConnect Protocol:</ThemedText> Secure, decentralized 
          connections without sharing private keys.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Authentication">
        <ThemedText>
          AppKit supports multiple authentication methods for seamless user onboarding:
        </ThemedText>
        <ThemedText>• Traditional wallet connections via WalletConnect</ThemedText>
        <ThemedText>• Email-based authentication with magic links</ThemedText>
        <ThemedText>• Social login integration (Apple, Twitter, Discord)</ThemedText>
        <ThemedText>• One-click authentication with Sign-In with Ethereum (SIWE)</ThemedText>
        <ThemedText>
          These authentication methods make Web3 accessible to everyone, regardless of their 
          crypto experience level.
        </ThemedText>
        <ExternalLink href="https://docs.reown.com/appkit/authentication/socials.md">
          <ThemedText type="link">Learn about Authentication</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Optional Features">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Wallet Detection:</ThemedText> Enhance UX by detecting 
          installed wallets and showing green checkmarks. Configure in Info.plist for iOS.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Coinbase Wallet:</ThemedText> Special integration for 
          Coinbase Wallet using their proprietary SDK. Requires additional setup but provides 
          native Coinbase Wallet experience.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Analytics:</ThemedText> Built-in analytics support 
          to track user interactions and wallet connections.
        </ThemedText>
        <ExternalLink href="https://docs.reown.com/appkit/react-native/#enable-wallet-detection-optional">
          <ThemedText type="link">Configure Optional Features</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Supported Chains">
        <ThemedText>
          AppKit supports multiple blockchain networks out of the box:
        </ThemedText>
        <ThemedText>• Ethereum Mainnet</ThemedText>
        <ThemedText>• Polygon</ThemedText>
        <ThemedText>• Arbitrum</ThemedText>
        <ThemedText>• And many more through custom configuration</ThemedText>
        <ThemedText>
          You can configure which chains to support in your wagmiConfig, allowing users to 
          switch between networks seamlessly.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Getting Started">
        <ThemedText>
          To get started with AppKit React Native:
        </ThemedText>
        <ThemedText>1. Get a project ID from the Reown Dashboard</ThemedText>
        <ThemedText>2. Install the required packages</ThemedText>
        <ThemedText>3. Configure your wagmiConfig with chains and metadata</ThemedText>
        <ThemedText>4. Initialize AppKit with createAppKit()</ThemedText>
        <ThemedText>5. Add the AppKit component to your app</ThemedText>
        <ThemedText>
          Check out the examples and test apps to see AppKit in action!
        </ThemedText>
        <ExternalLink href="https://docs.reown.com/appkit/react-native/#examples">
          <ThemedText type="link">View Examples</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Support & Community">
        <ThemedText>
          Reown is committed to delivering the best developer experience. If you have questions, 
          feature requests, or bug reports:
        </ThemedText>
        <ThemedText>• Open an issue on GitHub</ThemedText>
        <ThemedText>• Join the community discussions</ThemedText>
        <ThemedText>• Check out the comprehensive documentation</ThemedText>
        <ThemedText>
          The AppKit team provides excellent support to help you build amazing Web3 experiences.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: 0,
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
