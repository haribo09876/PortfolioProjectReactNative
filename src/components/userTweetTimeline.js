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
              id: doc.id, // Unique document ID (문서 고유 ID)
            };
          });
          setTweets(updatedTweets); // Update tweet state (트윗 상태 업데이트)
        }
      });

    return () => unsubscribe(); // Cleanup listener on unmount (컴포넌트 해제 시 리스너 정리)
  }, []);

  // 삭제 시 호출될 함수 (삭제된 tweet id를 받아서 state에서 제거)
  const handleDelete = deletedId => {
    setTweets(prev => prev.filter(tweet => tweet.id !== deletedId));
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper} horizontal={true}>
      {tweets.map(tweet => {
        const preview =
          tweet.tweet.length > 30
            ? tweet.tweet.slice(0, 30) + '...' // Truncate long tweets for preview (긴 트윗은 미리보기용으로 자르기)
            : tweet.tweet;
        return (
          <View key={tweet.id} style={styles.tweetWrapper}>
            <Tweet {...tweet} tweet={preview} onDelete={handleDelete} />
            {/* Render tweet component with preview (미리보기 포함 트윗 컴포넌트 렌더링) */}
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
