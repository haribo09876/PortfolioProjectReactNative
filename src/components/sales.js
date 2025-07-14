import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Sales() {
  const [sales, setSales] = useState([]); // State for storing sales data (판매 데이터 상태 저장용)
  const user = auth().currentUser; // Get current authenticated user (현재 로그인된 사용자 객체)

  useEffect(() => {
    if (!user) {
      return; // Exit if no authenticated user (인증된 사용자가 없으면 종료)
    }

    // Subscribe to real-time updates on user's sales (해당 사용자의 판매 데이터 실시간 구독)
    const unsubscribe = firestore()
      .collection('sales')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (querySnapshot) {
            // Map Firestore docs to local state format (Firestore 문서 데이터를 상태 형식으로 매핑)
            const salesData = querySnapshot.docs.map(doc => {
              const {itemId, createdAt, itemPrice, itemTitle, userId} =
                doc.data();
              return {
                itemId,
                createdAt: createdAt ? createdAt.toDate() : new Date(),
                itemPrice,
                itemTitle,
                userId,
                id: doc.id, // Firestore document ID (문서 고유 ID)
              };
            });
            setSales(salesData); // Update sales state (판매 상태 업데이트)
          }
        },
        error => {
          console.error('Firestore query error: ', error);
        },
      );

    return () => unsubscribe(); // Cleanup listener on unmount (컴포넌트 언마운트 시 리스너 정리)
  }, [user]); // Re-run when user changes (user 변경 시 재실행)

  return (
    <View style={styles.container}>
      {sales.map(item => (
        <View key={item.id} style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{item.itemTitle}</Text>
          <Text style={styles.itemPrice}>
            {item.itemPrice.toLocaleString()} 원
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 0.2,
    borderBottomWidth: 0.2,
    borderColor: 'rgba(176, 176, 176, 1)',
  },
  itemTitle: {
    color: 'rgba(89, 89, 89, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
  itemPrice: {
    color: 'rgba(68, 88, 200, 1)',
    fontSize: 15,
    fontWeight: '500',
  },
});
