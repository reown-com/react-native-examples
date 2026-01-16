import { useNavigation } from '@react-navigation/native';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

import SvgChevronRight from '@/assets/ChevronRight';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface IndividualSessionProps {
  name: string | undefined;
  icons: string;
  url: string;
  topic: string;
}

const IndividualSession = ({
  name,
  icons,
  url,
  topic,
}: IndividualSessionProps) => {
  const icon = icons ? icons : null;
  const navigator = useNavigation();
  const Theme = useTheme();

  const onPress = () => {
    navigator.navigate('SessionDetail', { topic: topic });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.flexRow}>
        {icon ? (
          <Image source={{ uri: icon }} style={styles.iconContainer} />
        ) : null}
        <View style={styles.textContainer}>
          <Text variant="h6-500" color="text-primary">
            {name ? name : 'No Name'}
          </Text>
          <Text
            variant="md-400"
            color="text-secondary"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {url}
          </Text>
        </View>
        <SvgChevronRight
          fill={Theme['text-secondary']}
          height={16}
          width={16}
        />
      </View>
    </TouchableOpacity>
  );
};

export default IndividualSession;

const styles = StyleSheet.create({
  container: {
    height: Spacing['extra-1'],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 60,
    width: 60,
    borderRadius: BorderRadius.full,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    paddingLeft: Spacing[3],
    marginRight: Spacing[3],
    flex: 1,
  },
});
