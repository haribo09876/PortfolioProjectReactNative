import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Text,
  FlatList,
} from 'react-native';
import {StackedBarChart} from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const DashboardShop = () => {
  const [data, setData] = useState({
    labels: [],
    legend: [],
    data: [],
    barColors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('sales').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());

        let total = 0;
        const itemTotals = {};
        const groupedData = salesData.reduce((acc, sale) => {
          const date = sale.createdAt.toDate().toISOString().split('T')[0];
          const itemTitle = sale.itemTitle;
          const itemPrice = sale.itemPrice;

          total += itemPrice;
          itemTotals[itemTitle] = (itemTotals[itemTitle] || 0) + itemPrice;

          if (!acc[date]) acc[date] = {};
          acc[date][itemTitle] = (acc[date][itemTitle] || 0) + itemPrice;

          return acc;
        }, {});

        const labels = Object.keys(groupedData).sort();
        const legend = Array.from(
          new Set(Object.values(groupedData).flatMap(obj => Object.keys(obj))),
        );
        const data = labels.map(date =>
          legend.map(title => groupedData[date][title] || 0),
        );
        const barColors = [
          '#3366FF',
          '#FF9900',
          '#109618',
          '#990099',
          '#FF3366',
          '#66FF33',
          '#33CCCC',
          '#FF66CC',
        ];

        const sortedItems = Object.entries(itemTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([title, amount]) => ({title, amount}));

        setData({labels, legend, data, barColors});
        setTotalSales(total);
        setTopItems(sortedItems.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('데이터를 불러오지 못했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 매출 대시보드</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>총 매출</Text>
        <Text style={styles.cardValue}>{totalSales.toLocaleString()} 원</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 인기 품목 TOP 5</Text>
        {topItems.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            {index + 1}. {item.title} - {item.amount.toLocaleString()} 원
          </Text>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <StackedBarChart
          data={{
            labels: data.labels,
            legend: data.legend,
            data: data.data,
            barColors: data.barColors,
          }}
          width={screenWidth * data.labels.length * 0.4}
          height={360}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f7f7f7',
            backgroundGradientTo: '#e0e0e0',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 15,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3366FF',
  },
  itemText: {
    fontSize: 16,
    marginVertical: 2,
  },
});

export default DashboardShop;
