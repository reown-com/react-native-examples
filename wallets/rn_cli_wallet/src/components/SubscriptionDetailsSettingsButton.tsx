import {useTheme} from '@/hooks/useTheme';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, Text} from 'react-native';

type SubscriptionDetailsSettingsButtonProps = {
  topic: string;
  name: string;
};

export default function SubscriptionDetailsSettingsButton({
  topic,
  name,
}: SubscriptionDetailsSettingsButtonProps) {
  const navigation = useNavigation();
  const Theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        navigation.navigate('SubscriptionSettingsScreen', {
          topic,
          name,
        });
      }}>
      <Text style={[style.buttonText, {color: Theme['fg-100']}]}>Settings</Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
  buttonText: {
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
