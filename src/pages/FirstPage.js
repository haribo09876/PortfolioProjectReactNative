import {View, Text, StyleSheet} from 'react-native';

function FirstPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>
      <Text style={styles.text}>Authentification</Text>
      <Text style={styles.text}>SignUp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default FirstPage;
