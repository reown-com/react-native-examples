import {useTheme} from '@/hooks/useTheme';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type SubscriptionListTabHeaderProps = {
  page: number;
  setPage: (index: number) => void;
};

export default function SubscriptionListTabHeader({
  page,
  setPage,
}: SubscriptionListTabHeaderProps) {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['accent-glass-005'],
          borderColor: Theme['gray-glass-010'],
        },
      ]}>
      <Pressable
        style={styles.button}
        onPress={() => {
          setPage(0);
        }}>
        <Text
          style={{
            color: page === 0 ? Theme['accent-100'] : Theme['gray-glass-030'],
          }}>
          Subscriptions
        </Text>
      </Pressable>
      <Pressable
        style={{paddingHorizontal: 16, paddingVertical: 8}}
        onPress={() => {
          setPage(1);
        }}>
        <Text
          style={{
            color: page === 1 ? Theme['accent-100'] : Theme['gray-glass-030'],
          }}>
          Discover
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  button: {paddingHorizontal: 16, paddingVertical: 8},
});
