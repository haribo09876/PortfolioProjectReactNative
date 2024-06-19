import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
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
    <ScrollView contentContainerStyle={styles.wrapper}>
      {tweets.map(tweet => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 5,
  },
});
