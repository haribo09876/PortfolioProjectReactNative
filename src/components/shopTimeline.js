import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Shop from './shop';

export default function ShopTimeline() {
  const [shops, setShops] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes (Firebase 인증 상태 변경 리스너 등록)
    const unsubscribeAuth = auth().onAuthStateChanged(u => {
      setUser(u); // Update user state (사용자 상태 업데이트)
      if (!u) {
        setShops([]); // Clear shop list on logout (로그아웃 시 상점 리스트 초기화)
      }
    });
    return () => unsubscribeAuth(); // Cleanup on unmount (언마운트 시 리스너 해제)
  }, []);

  useEffect(() => {
    if (!user) return; // Exit if user is not authenticated (사용자가 없으면 종료)

    // Subscribe to Firestore 'shops' collection with real-time updates (실시간 상점 데이터 구독)
    const unsubscribeFirestore = firestore()
      .collection('shops')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (!querySnapshot || !querySnapshot.docs) {
            setShops([]); // If snapshot is invalid, reset list (스냅샷 유효하지 않으면 초기화)
            return;
          }
          const updatedShops = querySnapshot.docs.map(doc => {
            const {
              itemTitle,
              itemPrice,
              itemDetail,
              createdAt,
              userId,
              username,
              photo,
            } = doc.data();
            return {
              itemTitle,
              itemPrice,
              itemDetail,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id, // Document ID (문서 고유 ID)
            };
          });
          setShops(updatedShops); // Update state with shop data (상점 리스트 상태 업데이트)
        },
        error => {
          console.error('Firestore snapshot error: ', error);
          setShops([]); // Reset shop list on error (에러 시 초기화)
        },
      );
    return () => unsubscribeFirestore(); // Cleanup listener (리스너 정리)
  }, [user]);

  const renderItem = ({item}) => <Shop key={item.id} {...item} />;

  return (
    <FlatList
      data={shops} // Data source for FlatList (FlatList 데이터 소스)
      renderItem={renderItem} // Item renderer (아이템 렌더러)
      keyExtractor={item => item.id} // Unique key for each item (각 아이템의 고유 키)
      numColumns={2} // Display items in two columns (2열 그리드 형식)
    />
  );
}
