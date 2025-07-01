import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import MapView, {UrlTile, Marker} from '@milad445/react-native-osmdroid';

export default function DashboardLocation() {
  const [locations, setLocations] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.524134,
    longitude: 126.985,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesSnapshot = await firestore().collection('locations').get();
        const salesData = salesSnapshot.docs.map(doc => doc.data());
        const validData = salesData.filter(
          loc => loc.createdAt && loc.latitude && loc.longitude,
        );
        const locationsArray = validData.map(loc => {
          const date = loc.createdAt.toDate().toISOString().split('T')[0];
          return {
            date,
            city: loc.city,
            latitude: loc.latitude,
            longitude: loc.longitude,
          };
        });
        setLocations(locationsArray);
      } catch (error) {
        console.error('Error fetching data: ', error);
        Alert.alert(
          'Data Load Failed',
          'An error occurred while fetching location data.',
        );
      }
    };
    fetchData();
  }, []);

  const zoomIn = () => {
    const newLatitudeDelta = Math.max(region.latitudeDelta / 2, 0.002);
    const newLongitudeDelta = Math.max(region.longitudeDelta / 2, 0.002);

    setRegion(prev => ({
      ...prev,
      latitudeDelta: newLatitudeDelta,
      longitudeDelta: newLongitudeDelta,
    }));
  };

  const zoomOut = () => {
    const newLatitudeDelta = Math.min(region.latitudeDelta * 2, 1.0);
    const newLongitudeDelta = Math.min(region.longitudeDelta * 2, 1.0);

    setRegion(prev => ({
      ...prev,
      latitudeDelta: newLatitudeDelta,
      longitudeDelta: newLongitudeDelta,
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
          onRegionChangeComplete={setRegion}>
          <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map((location, index) => (
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
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
            <Text style={styles.zoomText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
            <Text style={styles.zoomText}>－</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    alignItems: 'center',
  },
  mapContainer: {
    width: 320,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: 'rgba(240, 68, 82, 1)',
    width: 15,
    height: 15,
    borderRadius: 10,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'column',
    backgroundColor: 'rgba(68, 88, 200, 1)',
    borderRadius: 10,
    paddingVertical: 5,
  },
  zoomButton: {
    width: 45,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 1)',
  },
});
