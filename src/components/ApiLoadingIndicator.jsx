import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../tailwind.config';

let requestCounter = 0;
const listeners = new Set();

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 9999,
  },
  loader: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export const apiLoadingState = {
  startLoading: () => {
    requestCounter++;
    notifyListeners();
  },
  endLoading: () => {
    requestCounter = Math.max(0, requestCounter - 1);
    notifyListeners();
  },
  getIsLoading: () => requestCounter > 0,
  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};

const notifyListeners = () => {
  listeners.forEach(callback => callback(apiLoadingState.getIsLoading()));
};

const ApiLoadingIndicator = () => {
  const [isLoading, setIsLoading] = useState(apiLoadingState.getIsLoading());

  useEffect(() => {
    return apiLoadingState.subscribe(setIsLoading);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    </View>
  );
};

export default ApiLoadingIndicator;
