import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Tweet from './tweet';

export default function TweetTimeline() {
  const [tweets, setTweets] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes (Firebase 인증 상태 변경 구독)
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u); // Update user context (사용자 정보 갱신)
      if (!u) {
        setTweets([]); // Clear tweets if user logs out (로그아웃 시 트윗 초기화)
      }
    });
    return () => unsubscribeAuth(); // Cleanup subscription on unmount (언마운트 시 정리)
  }, []);

  useEffect(() => {
    if (!user) return; // Exit if unauthenticated (인증되지 않은 경우 종료)

    // Real-time listener for Firestore 'tweets' collection (Firestore 'tweets' 실시간 리스너 등록)
    const unsubscribeFirestore = firestore()
      .collection('tweets')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setTweets([]); // Reset if snapshot invalid (스냅샷 유효하지 않으면 초기화)
            return;
          }
          // Map Firestore documents to local tweet objects (Firestore 문서를 로컬 객체로 매핑)
          const updatedTweets = querySnapshot.docs.map(doc => {
            const {tweet, createdAt, userId, username, photo} = doc.data();
            return {
              tweet,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id, // Unique document ID (고유 문서 ID)
            };
          });
          setTweets(updatedTweets); // Update local tweet state (로컬 상태 갱신)
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setTweets([]); // Reset on error (오류 발생 시 초기화)
        },
      );
    return () => unsubscribeFirestore(); // Cleanup listener on unmount (언마운트 시 리스너 해제)
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      {tweets.map(tweet => (
        <Tweet key={tweet.id} {...tweet} /> // Render tweet component (트윗 컴포넌트 렌더링)
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
});
