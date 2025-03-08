import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { decode } from 'html-entities';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import useRSSStore from '../store/rssStore';
import { useTheme } from '../../App';

const RSSDetailScreen = () => {
  const { selectedItem, clearSelectedItem } = useRSSStore();
  const theme = useTheme();
  const navigation = useNavigation();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';

  // Helper to strip HTML and decode entities
  const getPlainText = (html) => {
    if (!html) { return ''; }
    // First strip HTML tags
    const strippedHtml = html.replace(/<[^>]+>/g, '');
    // Then decode HTML entities
    return decode(strippedHtml);
  };

  // Handle back button press
  const handleBack = () => {
    clearSelectedItem();
    navigation.goBack();
  };

  if (!selectedItem) {
    return (
      <SafeAreaView style={tw`flex-1 ${backgroundColor} items-center justify-center`}>
        <Text style={tw`${textColor}`}>No item selected</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-primary px-4 py-2 rounded-lg`}
          onPress={handleBack}
        >
          <Text style={tw`text-white font-bold`}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const contentText = getPlainText(selectedItem.content || selectedItem.description || '');
  const publishedDate = new Date(selectedItem.published).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      <View style={tw`p-4 flex-row items-center border-b ${theme.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <TouchableOpacity
          style={tw`p-2`}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={tw`${textColor} text-lg font-semibold ml-2`}>Newsletter</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-bold ${textColor} mb-2`}>{selectedItem.title}</Text>
          <Text style={tw`${secondaryTextColor} mb-4`}>
            {publishedDate}
            {selectedItem.authors && selectedItem.authors.length > 0
              ? ` • ${selectedItem.authors[0].name}`
              : ''}
          </Text>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`${textColor} text-base leading-6`}>
            {contentText || 'No content available for this item.'}
          </Text>
        </View>

        {selectedItem.links && selectedItem.links.length > 0 && (
          <View style={tw`mt-4 p-4 rounded-lg ${theme.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Text style={tw`${textColor} font-semibold mb-2`}>Links:</Text>
            {selectedItem.links.map((link, index) => (
              <Text key={index} style={tw`${secondaryTextColor}`}>
                {link.url}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RSSDetailScreen;
