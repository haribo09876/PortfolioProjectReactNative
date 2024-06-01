import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Tweet from './tweet';

export default function Timeline() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tweets')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const updatedTweets = querySnapshot.docs.map(doc => {
          const {tweet, createdAt, userId, username, photo} = doc.data();
          return {
            tweet,
            createdAt: createdAt ? createdAt.toDate() : new Date(), // createdAt이 null일 경우 현재 시간으로 대체
            userId,
            username,
            photo,
            id: doc.id,
          };
        });
        setTweets(updatedTweets);
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
    padding: 10,
  },
});
