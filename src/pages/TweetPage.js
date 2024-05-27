import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {addDoc, collection} from 'firebase/firestore';
import {auth, firestore} from '../firebase';

export default function PostTweetForm() {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState(null);

  const onChange = text => {
    setTweet(text);
  };

  const onFileChange = async () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await launchCamera({
              mediaType: 'photo',
              cameraType: 'back',
            });
            handleImageResult(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            handleImageResult(result);
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleImageResult = result => {
    if (result.errorCode) {
      console.error('Image Picker Error: ', result.errorMessage);
    } else if (!result.didCancel && result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user || isLoading || tweet === '' || tweet.length > 180) {
      return;
    }
    try {
      setLoading(true);
      await addDoc(collection(firestore, 'tweets'), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || 'Anonymous',
        userId: user.uid,
      });
      Alert.alert('Success', 'Tweet has been posted.');
      setTweet('');
      setFile(null);
    } catch (error) {
      console.error('Error posting tweet:', error);
      Alert.alert('Error', 'Failed to post tweet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        maxLength={180}
        onChangeText={onChange}
        value={tweet}
        placeholder="Tweet Here!"
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={styles.attachFileButton}
        onPress={onFileChange}
        disabled={!!file}
        accessibilityLabel="Add Image Button"
        accessibilityHint="Open image picker to add an image to your tweet">
        <Text style={styles.attachFileButtonText}>
          {file ? 'Image Added ✅' : 'Add Image'}
        </Text>
      </TouchableOpacity>
      {file && (
        <TouchableOpacity
          style={styles.clearFileButton}
          onPress={clearFile}
          accessibilityLabel="Remove Image Button"
          accessibilityHint="Remove selected image">
          <Text style={styles.clearFileButtonText}>Remove Image ❌</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={onSubmit}
        disabled={isLoading}
        accessibilityLabel="Post Tweet Button"
        accessibilityHint="Submit your tweet">
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Post Tweet</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'honeydew',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textArea: {
    borderColor: '#1d9bf0',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  attachFileButton: {
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#1d9bf0',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  attachFileButtonText: {
    color: '#1d9bf0',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFileButton: {
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: 'red',
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  clearFileButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#1d9bf0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
