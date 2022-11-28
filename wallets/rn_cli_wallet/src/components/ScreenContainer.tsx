import {ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';

type ScreenContainerProps = {
  children: ReactNode;
};

const ScreenContainer: React.FC<ScreenContainerProps> = ({children}) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
});

export default ScreenContainer;
