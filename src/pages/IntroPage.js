import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

function IntroPage() {
  const navigation = useNavigation(); // Navigation object (네비게이션 객체)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PPRN</Text>
      <Text style={styles.semiTitle}>
        Portfolio Project with React Native and Firebase
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginPage')}>
        {/* Navigate to LoginPage screen (로그인 페이지로 이동) */}
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
    width: 340,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default IntroPage;
