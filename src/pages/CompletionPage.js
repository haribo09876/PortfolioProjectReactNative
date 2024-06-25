import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

function CompletionPage() {
  const navigation = useNavigation();

  const toHomePage = async () => {
    try {
      navigation.navigate('HomePage');
    } catch (error) {
      console.error('Error purchase:', error);
    }
  };

  const toUserPage = async () => {
    try {
      navigation.navigate('UserPage');
    } catch (error) {
      console.error('Error purchase:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>상품 구매가 완료되었습니다</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.purchaseButton} onPress={toHomePage}>
          <Text style={styles.purchaseText}>홈페이지로</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.purchaseButton} onPress={toUserPage}>
          <Text style={styles.purchaseText}>마이페이지로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseButton: {
    width: '40%',
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 10,
  },
  purchaseText: {
    color: 'white',
    fontSize: 20,
  },
});

export default CompletionPage;
