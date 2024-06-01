import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

export default function Tweet({username, avatar, tweet, photo, id, userId}) {
  const currentUser = auth().currentUser;

  const deleteTweet = async () => {
    try {
      await firestore().collection('tweets').doc(id).delete();
      if (photo) {
        const storageRef = storage().refFromURL(photo);
        await storageRef.delete();
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <MaterialCommunityIcons name="account-circle" size={50} />
      <View style={styles.content}>
        <Text style={styles.username}>{username}</Text>
        {photo && <Image style={styles.photo} source={{uri: photo}} />}
        <Text style={styles.payload}>{tweet}</Text>
        {currentUser && currentUser.uid === userId && (
          <TouchableOpacity onPress={deleteTweet} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
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
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  deleteText: {
    color: 'white',
    fontSize: 14,
  },
});
