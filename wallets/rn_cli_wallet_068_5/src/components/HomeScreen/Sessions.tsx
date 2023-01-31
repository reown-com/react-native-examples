import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import SignClient from '@walletconnect/sign-client';
import IndividualSession from './IndividualSession';

interface ISessionsProps {
  signClient: SignClient | undefined;
}

const Sessions = ({signClient}: ISessionsProps) => {
  const sessions = signClient?.session?.values;

  // @notice: Empty State with no Session
  const emptyState = (
    <View style={styles.container}>
      <Image
        source={require('../../assets/emptyStateIcon.png')}
        style={styles.imageContainer}
      />
      <Text style={styles.greyText}>
        Apps you connect with will appear here. To connect 📱 scan or 📋 paste
        the code that is displayed in the app.
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {sessions
        ? sessions.map((session, index) => {
            const {name, icons, url} = session.peer.metadata;
            return (
              <IndividualSession
                key={index}
                icons={icons.toString()}
                name={name}
                url={url}
              />
            );
          })
        : emptyState}
    </ScrollView>
  );
};

export default Sessions;

const styles = StyleSheet.create({
  scrollViewContainer: {
    marginTop: 16,
  },
  sessionContainer: {
    height: 80,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#798686',
    width: '80%',
    textAlign: 'center',
  },
  imageContainer: {
    height: 30,
    width: 35,
    marginBottom: 16,
  },
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // ToDo: Fix this by passing props in StyleSheet
    // backgroundColor: isDarkMode ? Colors.black : Colors.white,
  },
});
