import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import {StackedBarChart, PieChart} from 'react-native-chart-kit';
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
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('sales').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());
        let total = 0;
        const itemTotals = {};
        const groupedData = {};

        for (const sale of salesData) {
          const date = sale.createdAt.toDate().toISOString().split('T')[0];
          const itemTitle = sale.itemTitle;
          const itemPrice = sale.itemPrice;

          total += itemPrice;
          itemTotals[itemTitle] = (itemTotals[itemTitle] || 0) + itemPrice;

          if (!groupedData[date]) groupedData[date] = {};
          groupedData[date][itemTitle] =
            (groupedData[date][itemTitle] || 0) + itemPrice;
        }
        const labels = Object.keys(groupedData).sort();
        const legend = Array.from(
          new Set(Object.values(groupedData).flatMap(obj => Object.keys(obj))),
        );
        const chartData = labels.map(date =>
          legend.map(title => groupedData[date][title] || 0),
        );
        const pieColors = [
          '#3366FF',
          '#FF9900',
          '#109618',
          '#990099',
          '#FF3366',
          '#66FF33',
        ];
        const pie = Object.entries(itemTotals).map(([title, amount], idx) => ({
          name: title,
          amount,
          color: pieColors[idx % pieColors.length],
          legendFontColor: '#000',
          legendFontSize: 14,
        }));

        const sortedItems = Object.entries(itemTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([title, amount]) => ({title, amount}));

        setData({labels, legend, data: chartData, barColors: pieColors});
        setTotalSales(total);
        setTopItems(sortedItems.slice(0, 5));
        setPieData(pie);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
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
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total sales revenue</Text>
        <Text style={styles.cardValue}>{totalSales.toLocaleString()} 원</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top 5 items by revenue</Text>
        {topItems.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            {index + 1}. {item.title} : {item.amount.toLocaleString()}원
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
            backgroundColor: '#fff',
            backgroundGradientFrom: '#f0f0f0',
            backgroundGradientTo: '#dfe6e9',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{marginVertical: 8, borderRadius: 16}}
        />
      </ScrollView>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sales Ratio by Item</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
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
