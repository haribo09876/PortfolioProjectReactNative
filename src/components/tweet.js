import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const Tweet = ({id, photo, tweet, userId, username, createdAt}) => {
  return (
    <View style={styles.tweetContainer}>
      {photo ? (
        <Image source={{uri: photo}} style={styles.photo} />
      ) : (
        <View style={styles.placeholderPhoto} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.tweet}>{tweet}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>
            {new Date(createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tweetContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#FFFFFF',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  placeholderPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: '#e1e8ed',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tweet: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 15,
    color: '#1DA1F2',
    marginRight: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#657786',
  },
});

export default Tweet;
