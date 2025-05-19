import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

function IntroPage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PPRN</Text>
      <Text style={styles.semiTitle}>Welcome to PPRN</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginPage')}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '500',
    color: 'black',
    marginTop: 180,
    marginBottom: 5,
  },
  semiTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(176, 176, 176, 1)',
    marginBottom: 250,
  },
  button: {
    backgroundColor: 'rgba(68, 88, 200, 1)',
    width: 360,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default IntroPage;
