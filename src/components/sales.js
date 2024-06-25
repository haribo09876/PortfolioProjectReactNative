import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
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
      .onSnapshot(querySnapshot => {
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
        } else {
          console.log('No data found');
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {sales.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.itemTitle}</Text>
            <Text style={styles.itemPrice}>{item.itemPrice} 원</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CED0CE',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 18,
    color: '#1DA1F2', // Adjust color as needed
  },
});
