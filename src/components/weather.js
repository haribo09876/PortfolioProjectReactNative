import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {WEATHER_API_KEY} from '@env';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const icons = {
  Mist: 'weather-fog',
  Haze: 'weather-hazy',
  Snow: 'weather-snowy',
  Clear: 'weather-sunny',
  Rain: 'weather-pouring',
  Clouds: 'weather-cloudy',
  Drizzle: 'weather-rainy',
  Atmosphere: 'weather-fog',
  Thunderstorm: 'weather-lightning-rainy',
};

export default function Weather() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [currentWeather, setCurrentWeather] = useState('');
  const [currentTemp, setCurrentTemp] = useState(0);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermission(true);
          } else {
            handleLocationError("Can't find location");
          }
        } catch (error) {
          console.error('Error requesting location permission: ', error);
          handleLocationError("Can't find location");
        }
      } else {
        setLocationPermission(true);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermission && !locationSaved) {
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          fetchWeather(latitude, longitude);
        },
        error => {
          console.error('Error getting location: ', error);
          handleLocationError("Can't find location");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
          distanceFilter: 1,
        },
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    } else {
      handleLocationError("Can't find location");
    }
  }, [locationPermission, locationSaved]);

  const fetchWeather = async (latitude, longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`;
    const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`;

    try {
      const [response, responseCurrent] = await Promise.all([
        axios.get(url),
        axios.get(urlCurrent),
      ]);
      setCity(response.data.city.name);
      setDays(response.data.list);
      setCurrentWeather(responseCurrent.data.weather[0].main);
      setCurrentTemp(responseCurrent.data.main.temp);
      saveLocationToFirestore(response.data.city.name, latitude, longitude);
      setLocationSaved(true);
    } catch (error) {
      console.error('Error fetching weather data: ', error);
      handleLocationError("Can't find location");
    }
  };

  const saveLocationToFirestore = async (city, latitude, longitude) => {
    const locationRef = firestore().collection('locations').doc();
    const locationData = {
      createdAt: firestore.FieldValue.serverTimestamp(),
      city: city,
      latitude: latitude,
      longitude: longitude,
    };

    try {
      await locationRef.set(locationData);
    } catch (error) {
      console.error('Error saving location to Firestore: ', error);
      Alert.alert('Error', 'Failed to save location information.');
    }
  };

  const handleLocationError = errorMessage => {
    setCity(city);
    setLocationPermission(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        <Icon
          name={icons[currentWeather]}
          size={150}
          color="rgba(89, 89, 89, 1)"
        />
        <Text style={styles.currentWeather}>{currentWeather}</Text>
        <Text style={styles.currentWeather}>
          {parseFloat(currentTemp - 273).toFixed(1)} &#8451;
        </Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}>
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="rgba(89, 89, 89, 1)"
              style={{marginTop: 10}}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={styles.dayContent}>
                <Icon
                  name={icons[day.weather[0].main]}
                  size={58}
                  color="rgba(89, 89, 89, 1)"
                />
                <Text style={styles.weather}>{day.weather[0].main}</Text>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp - 273).toFixed(1)} &#8451;
                </Text>
                <Text style={styles.description}>
                  {day.dt_txt.substring(5, 7)}/{day.dt_txt.substring(8, 10)}
                </Text>
                <Text style={styles.description}>
                  {new Date(
                    new Date(day.dt_txt).getTime() + 9 * 60 * 60 * 1000,
                  ).getHours()}
                  시
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  city: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
    marginBottom: 120,
  },
  cityName: {
    fontSize: 40,
    fontWeight: '500',
    color: 'rgba(89, 89, 89, 1)',
  },
  currentWeather: {
    fontSize: 30,
    fontWeight: '500',
    color: 'rgba(89, 89, 89, 1)',
    paddingTop: 5,
  },
  day: {
    width: windowWidth / 4.5,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dayContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weather: {
    marginTop: -5,
    fontSize: 18,
    color: 'rgba(89, 89, 89, 1)',
    fontWeight: '500',
  },
  temp: {
    fontWeight: '500',
    fontSize: 19,
    color: 'rgba(89, 89, 89, 1)',
  },
  description: {
    fontSize: 15,
    color: 'rgba(89, 89, 89, 1)',
    fontWeight: '500',
  },
});
