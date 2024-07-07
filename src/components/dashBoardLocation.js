import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import MapView, {
  TileCacher,
  UrlTile,
  Marker,
} from '@milad445/react-native-osmdroid';

const {height} = Dimensions.get('window');

export default function DashboardLocation() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('locations').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());

        const groupedData = salesData.reduce((acc, location) => {
          const date = location.createdAt.toDate().toISOString().split('T')[0];
          const city = location.city;
          const latitude = location.latitude;
          const longitude = location.longitude;

          if (!acc[city]) {
            acc[city] = [];
          }
          acc[city].push({date, latitude, longitude});
          return acc;
        }, {});

        setLocations(groupedData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const cacheTiles = () => {
    TileCacher.cacheTilesFromDirectory('/storage/emulated/0/map/tiles', {
      showProgressToast: true,
    });
  };

  useEffect(() => {
    cacheTiles();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.5665,
            longitude: 126.978,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <UrlTile urlTemplate="http://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {Object.values(locations)
            .flat()
            .map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}>
                <View style={styles.customMarker} />
              </Marker>
            ))}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  mapContainer: {
    flex: 1,
    marginVertical: 10,
    height: height * 0.4,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: '#2979FF',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: 2,
  },
});
