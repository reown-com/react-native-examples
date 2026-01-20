import { useState } from 'react';

import { AccordionCard } from '@/components/AccordionCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AppPermissions } from '@/components/AppPermissions';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { formatDomain } from '@/utils/misc';

// Height constants for accordion animation
const PERMISSION_ROW_HEIGHT = 28;
const PERMISSIONS_COUNT = 3;
const PERMISSIONS_GAP = Spacing[2];
const PERMISSIONS_HEIGHT =
  PERMISSION_ROW_HEIGHT * PERMISSIONS_COUNT +
  PERMISSIONS_GAP * (PERMISSIONS_COUNT - 1);

interface AppInfoCardProps {
  url?: string;
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
}

export function AppInfoCard({ url, validation, isScam }: AppInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      onPress={() => setIsExpanded(prev => !prev)}
      expandedHeight={PERMISSIONS_HEIGHT}
    >
      <AppPermissions />
    </AccordionCard>
  );
}
