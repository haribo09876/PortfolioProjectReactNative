import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {collection, getDocs, orderBy, query} from 'firebase/firestore';
import {db} from '../firebase';
import Tweet from './tweet';

export default function Timeline() {
  const [tweets, setTweets] = useState([]);

  const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, 'tweets'),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(tweetsQuery);
    const tweets = snapshot.docs.map(doc => {
      const {tweet, createdAt, userId, username, photo} = doc.data();
      return {
        tweet,
        createdAt: createdAt.toDate(),
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };

  useEffect(() => {
    fetchTweets();
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
