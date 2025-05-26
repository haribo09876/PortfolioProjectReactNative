import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = firestore()
      .collection('sales')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (querySnapshot) {
            const salesData = querySnapshot.docs.map(doc => {
              const {itemId, createdAt, itemPrice, itemTitle, userId} =
                doc.data();
              return {
                itemId,
                createdAt: createdAt ? createdAt.toDate() : new Date(),
                itemPrice,
                itemTitle,
                userId,
                id: doc.id,
              };
            });
            setSales(salesData);
          }
        },
        error => {
          console.error('Firestore query error: ', error);
        },
      );

    return () => unsubscribe();
  }, [user]);

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
