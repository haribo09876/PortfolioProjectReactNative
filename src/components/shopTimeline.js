import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Shop from './shop';

export default function ShopTimeline() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('shops')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
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
            id: doc.id,
          };
        });
        setShops(updatedShops);
      });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      {shops.map(shop => (
        <Shop key={shop.id} {...shop} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
});
