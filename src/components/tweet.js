import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

export default function Tweet({username, photo, tweet}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.column}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.payload}>{tweet}</Text>
      </View>
      {photo && <Image style={styles.photo} source={{uri: photo}} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
  },
  column: {
    flex: 3,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
  },
  payload: {
    marginVertical: 10,
    fontSize: 18,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 15,
    flex: 1,
  },
});
