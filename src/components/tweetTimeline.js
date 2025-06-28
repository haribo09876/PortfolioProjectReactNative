import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Tweet from './tweet';

export default function TweetTimeline() {
  const [tweets, setTweets] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u);
      if (!u) {
        setTweets([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeFirestore = firestore()
      .collection('tweets')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setTweets([]);
            return;
          }
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
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setTweets([]);
        },
      );
    return () => unsubscribeFirestore();
  }, [user]);

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
    padding: 10,
  },
});
