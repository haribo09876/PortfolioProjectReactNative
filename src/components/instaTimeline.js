import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';

export default function InstaTimeline() {
  const [instas, setInstas] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes (Firebase 인증 상태 변화 감지)
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u); // Set current user (현재 사용자 설정)
      if (!u) {
        setInstas([]); // Clear feed if user logs out (로그아웃 시 피드 초기화)
      }
    });
    return () => unsubscribeAuth(); // Cleanup on unmount (언마운트 시 리스너 정리)
  }, []);

  useEffect(() => {
    if (!user) return; // Exit if user is not authenticated (사용자 미인증 시 종료)

    // Real-time Firestore listener on 'instas' collection (Firestore 실시간 리스너 설정)
    const unsubscribeFirestore = firestore()
      .collection('instas')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setInstas([]);
            return;
          }

          // Map Firestore docs to component-friendly objects (Firestore 문서 → 컴포넌트 적합 형태로 매핑)
          const updatedInstas = querySnapshot.docs.map(doc => {
            const {insta, createdAt, userId, username, photo} = doc.data();
            return {
              insta,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id, // Document ID as unique key (문서 ID → 고유 키)
            };
          });
          setInstas(updatedInstas); // Update feed state (피드 상태 업데이트)
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setInstas([]);
        },
      );
    return () => unsubscribeFirestore(); // Cleanup listener on unmount (언마운트 시 리스너 정리)
  }, [user]);

  const renderItem = ({item}) => <Insta key={item.id} {...item} />; // Render each Insta post (각 Insta 게시물 렌더링)

  return (
    <FlatList
      data={instas} // Feed data source (피드 데이터 소스)
      renderItem={renderItem} // Render item callback (항목 렌더링 콜백)
      keyExtractor={item => item.id} // Unique key for list item (목록 항목의 고유 키)
      numColumns={3} // Display in 3-column grid (3열 그리드로 표시)
    />
  );
}
