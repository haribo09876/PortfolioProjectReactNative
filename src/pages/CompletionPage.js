import {View, Text, StyleSheet} from 'react-native';

function CompletionPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>상품 구매가 완료되었습니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CompletionPage;
