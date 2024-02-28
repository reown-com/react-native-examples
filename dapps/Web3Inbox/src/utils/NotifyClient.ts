import {EXPLORER_API_BASE_URL, EXPLORER_ENDPOINTS} from '@/constants/Explorer';
import {SYM_KEY_PREFIX} from '@/constants/Storage';
import {ENV_PROJECT_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const projectId = ENV_PROJECT_ID;

export async function getSymKey(topic: string) {
  const getSymKeyUsingTopic = await AsyncStorage.getItem(
    `${SYM_KEY_PREFIX}${topic}`,
  );

  if (getSymKeyUsingTopic) {
    return getSymKeyUsingTopic;
  }

  throw new Error(`No symkey exists for such topic: ${topic}`);
}

export async function registerClient(deviceToken: string, clientId: string) {
  const body = JSON.stringify({
    client_id: clientId,
    token: deviceToken,
    type: 'fcm',
    always_raw: true,
  });

  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  };

  return fetch(
    `https://echo.walletconnect.com/${projectId}/clients`,
    requestOptions,
  )
    .then(response => response.json())
    .then(result => console.log('>>> registered client', result))
    .catch(error => console.log('>>> error while registering client', error));
}

export async function fetchFeaturedProjects<T>() {
  const explorerUrlFeatured = new URL(
    EXPLORER_ENDPOINTS.projects,
    EXPLORER_API_BASE_URL,
  );

  explorerUrlFeatured.searchParams.set('projectId', projectId);
  explorerUrlFeatured.searchParams.set('isVerified', 'true');
  explorerUrlFeatured.searchParams.set('isFeatured', 'true');

  try {
    const discoverProjectsData = await fetch(explorerUrlFeatured).then(
      async res => res.json(),
    );
    const discoverProjects = Object.values(discoverProjectsData.projects);

    return {
      data: discoverProjects as T,
    };
  } catch (error) {
    throw new Error(`Error fetching featured projects: ${error}`);
  }
}
