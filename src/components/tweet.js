import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Tweet({username, avatar, tweet, photo}) {
  return (
    <View style={styles.wrapper}>
      <MaterialCommunityIcons name="account-circle" size={50} />
      <View style={styles.content}>
        <Text style={styles.username}>{username}</Text>
        {photo ? <Image style={styles.photo} source={{uri: photo}} /> : null}
        <Text style={styles.payload}>{tweet}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
  },
  payload: {
    marginVertical: 5,
    fontSize: 16,
    color: '#666666',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});
