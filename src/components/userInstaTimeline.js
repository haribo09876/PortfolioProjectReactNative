import React, {useEffect, useState} from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Insta from './insta';
import auth from '@react-native-firebase/auth';

export default function UserInstaTimeline() {
  const [instas, setInstas] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    const unsubscribe = firestore()
      .collection('instas')
      .where('userId', '==', user?.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const updatedInstas = querySnapshot.docs.map(doc => {
            const {insta, createdAt, userId, username, photo} = doc.data();
            return {
              insta,
              createdAt: createdAt ? createdAt.toDate() : new Date(),
              userId,
              username,
              photo,
              id: doc.id, // Include document ID as unique key (문서 ID를 고유 키로 포함)
            };
          });
          setInstas(updatedInstas); // Update state with new data (상태에 새 데이터 업데이트)
        }
      });

    return () => unsubscribe(); // Cleanup listener on unmount (컴포넌트 언마운트 시 리스너 해제)
  }, []);

  // 수정된 insta 반영을 위한 상태 업데이트 함수
  const handleEdit = (id, updatedInsta, updatedPhoto) => {
    setInstas(prevInstas =>
      prevInstas.map(insta =>
        insta.id === id
          ? {...insta, insta: updatedInsta, photo: updatedPhoto}
          : insta,
      ),
    );
  };

  // 삭제 시 호출될 함수 (삭제된 insta id를 받아서 state에서 제거)
  const handleDelete = deletedId => {
    setInstas(prev => prev.filter(insta => insta.id !== deletedId));
  };

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {instas.map(insta => (
        <View key={insta.id} style={styles.instaWrapper}>
          <Insta {...insta} onEdit={handleEdit} onDelete={handleDelete} />
          {/* Spread insta props to child component (insta props를 자식 컴포넌트로 전달) */}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  instaWrapper: {
    transform: [{scale: 0.9}],
    margin: -5,
  },
});
