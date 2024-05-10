import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import AppNavigator from './components/navigator';

export default function App() {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>PPRN</Text>
      </View>
      <SafeAreaView />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
