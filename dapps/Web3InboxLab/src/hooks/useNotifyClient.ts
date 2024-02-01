import {useContext} from 'react';
import NotifyClientContext from '../context/NotifyClientContext';

const useNotifyClient = () => {
  const notifyClient = useContext(NotifyClientContext);

  if (!notifyClient) {
    throw new Error(
      'NotifyClientProvider not found. Make sure to wrap your component with NotifyClientProvider.',
    );
  }

  return notifyClient;
};

export default useNotifyClient;
