import { useEffect } from 'react';

import { usePairing } from '@/hooks/usePairing';
import Sessions from '@/screens/Connections/components/Sessions';
import { HomeTabScreenProps } from '@/utils/TypesUtil';

type Props = HomeTabScreenProps<'Connections'>;

export default function Connections({ route }: Props) {
  const { handleUriOrPaymentLink } = usePairing();

  useEffect(() => {
    // URI received from QR code scanner
    if (route.params?.uri) {
      handleUriOrPaymentLink(route.params.uri);
    }
  }, [route.params?.uri, handleUriOrPaymentLink]);

  return <Sessions />;
}
