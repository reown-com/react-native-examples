import { useState } from 'react';

import { AccordionCard } from '@/components/AccordionCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AppPermissions } from '@/components/AppPermissions';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { formatDomain } from '@/utils/WalletKitUtil';

// Height constants for accordion animation
const PERMISSION_ROW_HEIGHT = 28;
const PERMISSIONS_COUNT = 3;
const PERMISSIONS_GAP = Spacing[2];
export const APP_INFO_CARD_EXPANDED_HEIGHT =
  PERMISSION_ROW_HEIGHT * PERMISSIONS_COUNT +
  PERMISSIONS_GAP * (PERMISSIONS_COUNT - 1);

interface AppInfoCardProps {
  url?: string;
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
  /** Optional external control for expanded state */
  isExpanded?: boolean;
  /** Optional onPress handler for external control */
  onPress?: () => void;
}

export function AppInfoCard({
  url,
  validation,
  isScam,
  isExpanded: externalIsExpanded,
  onPress: externalOnPress,
}: AppInfoCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isControlled = externalIsExpanded !== undefined;
  const isExpanded = isControlled ? externalIsExpanded : internalIsExpanded;
  const onPress = isControlled
    ? (externalOnPress ?? (() => {}))
    : () => setInternalIsExpanded(prev => !prev);

  return (
    <AccordionCard
      headerContent={
        <Text
          variant="lg-400"
          color="text-tertiary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatDomain(url)}
        </Text>
      }
      rightContent={<VerifiedBadge validation={validation} isScam={isScam} />}
      isExpanded={isExpanded}
      onPress={onPress}
      expandedHeight={APP_INFO_CARD_EXPANDED_HEIGHT}
    >
      <AppPermissions />
    </AccordionCard>
  );
}
