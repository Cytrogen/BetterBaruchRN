import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import { useTheme } from '../../App';

const HomeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      <ScrollView contentContainerStyle={tw`pb-6`}>
        <View style={tw`p-6`}>
          <Text style={tw`text-3xl font-bold ${textColor} mb-2`}>Rally Nexus</Text>
          <Text style={tw`text-lg ${secondaryTextColor} mb-6`}>Your Campus Connection</Text>
        </View>

        <View style={tw`px-6 flex-1`}>
          <Text style={tw`text-xl font-semibold ${textColor} mb-4`}>Features</Text>

          <TouchableOpacity
            style={tw`mb-4 p-5 rounded-xl ${cardBg} shadow-md`}
            onPress={() => navigateToScreen('Clubs')}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-blue-500 p-3 rounded-lg mr-4`}>
                <Ionicons name="people" size={24} color="white" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-bold ${textColor}`}>Club Navigator</Text>
                <Text style={tw`${secondaryTextColor}`}>Explore campus clubs and organizations</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.secondaryText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`mb-4 p-5 rounded-xl ${cardBg} shadow-md`}
            onPress={() => navigateToScreen('Newsletter')}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-green-500 p-3 rounded-lg mr-4`}>
                <Ionicons name="newspaper" size={24} color="white" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-bold ${textColor}`}>Newsletter</Text>
                <Text style={tw`${secondaryTextColor}`}>Stay updated with latest campus news</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.secondaryText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`mb-4 p-5 rounded-xl ${cardBg} shadow-md`}
            onPress={() => navigateToScreen('Events')}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-purple-500 p-3 rounded-lg mr-4`}>
                <Ionicons name="calendar" size={24} color="white" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-bold ${textColor}`}>Campus Events</Text>
                <Text style={tw`${secondaryTextColor}`}>Discover upcoming events at Baruch</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.secondaryText} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
