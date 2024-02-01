import * as React from 'react';
import {useRoute} from '@react-navigation/native';
import {Text, View} from 'react-native';

export default function SubscriptionSettingsScreen() {
  const {params} = useRoute();
  const name = params?.name;

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{name}</Text>
    </View>
  );
}
