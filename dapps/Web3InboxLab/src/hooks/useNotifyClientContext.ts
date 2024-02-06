import {useContext} from 'react';
import NotifyClientContext from '../context/NotifyClientContext';

const useNotifyClientContext = () => {
  const notifyClient = useContext(NotifyClientContext);

  if (!notifyClient) {
    throw new Error(
      'NotifyClientProvider not found. Make sure to wrap your component with NotifyClientProvider.',
    );
  }

  return notifyClient;
};

export default useNotifyClientContext;
