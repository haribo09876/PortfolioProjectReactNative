import {View, Text, StyleSheet} from 'react-native';

function InstaPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Insta</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'cornsilk',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default InstaPage;
