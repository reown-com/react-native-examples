import {SYM_KEY_PREFIX} from '@/constants/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getSymKey(topic: string) {
  const getSymKeyUsingTopic = await AsyncStorage.getItem(
    `${SYM_KEY_PREFIX}${topic}`,
  );

  if (getSymKeyUsingTopic) {
    return getSymKeyUsingTopic;
  }

  throw new Error(`No symkey exists for such topic: ${topic}`);
}
