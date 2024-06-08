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
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_KEY = '174580b1f4ee4ec1e406e56c83717aed';
const windowWidth = Dimensions.get('window').width;

const icons = {
  Clouds: 'cloud',
  Clear: 'white-balance-sunny',
  Atmosphere: 'weather-fog',
  Snow: 'weather-snowy-heavy',
  Rain: 'weather-pouring',
  Drizzle: 'weather-fog',
  Thunderstorm: 'weather-lightning',
};

export default function Weather() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);

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
            setCity("Can't find location");
            setLocationPermission(false);
          }
        } catch (error) {
          console.error('Error requesting location permission: ', error);
          setCity("Can't find location");
          setLocationPermission(false);
        }
      } else {
        setLocationPermission(true);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          fetchWeather(latitude, longitude);
        },
        error => {
          console.error('Error getting location: ', error);
          setCity("Can't find location");
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
          distanceFilter: 1,
        },
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    } else {
      setCity("Can't find location");
    }
  }, [locationPermission]);

  const fetchWeather = async (latitude, longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    try {
      const response = await axios.get(url);
      setCity(response.data.city.name);
      setDays(response.data.list);
    } catch (error) {
      console.error('Error fetching weather data: ', error);
      setCity("Can't find location");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}>
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="white"
              style={{marginTop: 10}}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                <Icon
                  name={icons[day.weather[0].main]}
                  size={58}
                  color="white"
                />
                <Text style={styles.weather}>{day.weather[0].main}</Text>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp - 273).toFixed(1)}&#8451;
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
    backgroundColor: '#A9A9F5',
  },
  city: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 40,
    fontWeight: '500',
    color: 'white',
  },
  day: {
    width: windowWidth / 4,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  weather: {
    marginTop: -5,
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  temp: {
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 19,
    color: 'white',
  },
  description: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
});
