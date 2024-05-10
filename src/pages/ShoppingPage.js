import {View, Text, StyleSheet} from 'react-native';

function ShoppingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shop</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'honeydew',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ShoppingPage;
