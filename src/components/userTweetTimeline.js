import React, {useEffect, useState} from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Tweet from './tweet';
import auth from '@react-native-firebase/auth';

export default function UserTweetTimeline() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    const unsubscribe = firestore()
      .collection('tweets')
      .where('userId', '==', user?.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const updatedTweets = querySnapshot.docs.map(doc => {
            const {tweet, createdAt, userId, username, photo} = doc.data();
            return {
              tweet,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id,
            };
          });
          setTweets(updatedTweets);
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.wrapper} horizontal={true}>
      {tweets.map(tweet => {
        const preview =
          tweet.tweet.length > 30
            ? tweet.tweet.slice(0, 30) + '...'
            : tweet.tweet;
        return (
          <View key={tweet.id} style={styles.tweetWrapper}>
            <Tweet {...tweet} tweet={preview} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 5,
  },
  tweetWrapper: {
    transform: [{scale: 0.8}],
    margin: -40,
  },
});
