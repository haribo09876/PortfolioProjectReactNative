import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

function IntroPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PPRN에 오신 것을 환영합니다</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3498db',
    width: 250,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default IntroPage;
