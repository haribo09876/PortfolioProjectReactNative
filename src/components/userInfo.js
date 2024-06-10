import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function UserInfo() {
  return (
    <View style={styles.content}>
      <Text style={styles.text}>
        userInfo userInfo userInfo userInfo userInfo userInfo userInfo userInfo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 0.4,
  },
  text: {
    fontSize: 20,
  },
});
