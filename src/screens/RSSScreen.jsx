import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { decode } from 'html-entities';
import tw from '../styles/tailwind';
import useRSSStore from '../store/rssStore';
import { useTheme } from '../../App';

const RSSScreen = () => {
  const { items, loading, error, loadRSSItems, setSelectedItem } = useRSSStore();
  const theme = useTheme();
  const navigation = useNavigation();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';

  useEffect(() => {
    loadRSSItems().then(() => console.log('RSS feed loaded successfully'));
  }, [loadRSSItems]);

  const renderFooter = () => {
    if (!loading) { return null; }

    return (
      <View style={tw`py-4 items-center`}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  // Handle item press
  const handleItemPress = (item) => {
    setSelectedItem(item);
    navigation.navigate('RSSDetail');
  };

  // Helper to strip HTML and decode entities
  const getPlainText = (html) => {
    if (!html) { return ''; }
    // First strip HTML tags
    const strippedHtml = html.replace(/<[^>]+>/g, '');
    // Then decode HTML entities
    return decode(strippedHtml);
  };

  // Render RSS item
  const renderRSSItem = ({ item }) => {
    // Get a short preview of the content
    const contentText = getPlainText(item.content || item.description);
    const contentPreview = contentText.length > 120
      ? contentText.substring(0, 120) + '...'
      : contentText;

    return (
      <TouchableOpacity
        style={tw`mb-4 p-4 rounded-lg ${theme.isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
        onPress={() => handleItemPress(item)}
      >
        <Text style={tw`text-lg font-bold ${textColor} mb-2`}>{item.title}</Text>
        <Text style={tw`${secondaryTextColor} mb-1`}>{new Date(item.published).toLocaleDateString()}</Text>
        <Text style={tw`${textColor}`}>{contentPreview}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold ${textColor} mb-1`}>Newsletter</Text>
        <Text style={tw`text-lg ${secondaryTextColor} mb-4`}>Latest Updates</Text>
      </View>

      {error ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Text style={tw`text-red-500 mb-4`}>
            Error: {error}
          </Text>
          <TouchableOpacity
            style={tw`bg-primary px-4 py-2 rounded-lg`}
            onPress={loadRSSItems}
          >
            <Text style={tw`text-white font-bold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderRSSItem}
          keyExtractor={(item) => item.id || item.guid || item.title}
          contentContainerStyle={tw`px-4 pb-6`}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={loading && items.length === 0}
              onRefresh={loadRSSItems}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={tw`flex-1 items-center justify-center py-16`}>
                <Text style={tw`${secondaryTextColor}`}>No items found</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RSSScreen;
