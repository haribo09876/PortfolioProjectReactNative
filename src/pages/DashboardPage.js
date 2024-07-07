import {View, Text, StyleSheet, ScrollView} from 'react-native';
import DashboardShop from '../components/dashboardShop';
import DashboardLocation from '../components/dashboardLocation';

function DashboardPage() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>일자별 매출액</Text>
        <DashboardShop />
        <Text style={styles.sectionTitle}>접속 위치</Text>
        <DashboardLocation />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lavender',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default DashboardPage;
