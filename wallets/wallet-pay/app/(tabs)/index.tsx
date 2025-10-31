import { Text } from '@/components/primitives/text';
import { View } from '@/components/primitives/view';
import { router } from 'expo-router';
import { Pressable } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
      <Pressable onPress={() => router.navigate('/scanner')}>
        <Text>Go to Camera</Text>
      </Pressable>
      <Text>Soon</Text>
    </View>
  );
}
