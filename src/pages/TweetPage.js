import {View, Text, StyleSheet} from 'react-native';

function TweetPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tweet</Text>
      <Text style={styles.text}>TweetModal</Text>
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

export default TweetPage;
