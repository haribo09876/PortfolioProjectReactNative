import {View, Text, StyleSheet} from 'react-native';

function DashboardPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dashboard Location</Text>
      {/* <DashboardLocation /> */}
      <Text style={styles.sectionTitle}>Dashboard Shop</Text>
      {/* <DashboardShop /> */}
      <Text style={styles.sectionTitle}>Dashboard Tweet</Text>
      {/* <DashboardTweet /> */}
      <Text style={styles.sectionTitle}>Dashboard Insta</Text>
      {/* <DashboardInsta /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    marginTop: 20,
    marginBottom: 5,
  },
});

export default DashboardPage;
