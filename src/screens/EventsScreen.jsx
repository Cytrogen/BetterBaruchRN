import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import useEventStore from '../store/eventStore';
import { useTheme } from '../../App';

const EventsScreen = () => {
  const { events, loading, error, loadEvents, setSelectedEvent } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';
  const inputBg = theme.isDark ? 'bg-gray-700' : 'bg-gray-100';

  useEffect(() => {
    loadEvents().then(() => console.log('学校事件加载成功'));
  }, [loadEvents]);

  // 当事件数据或搜索查询变化时更新过滤后的事件
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      (event.plainDescription && event.plainDescription.toLowerCase().includes(query)) ||
      (event.location && event.location.toLowerCase().includes(query)) ||
      (event.organizer && event.organizer.toLowerCase().includes(query))
    );

    setFilteredEvents(filtered);
  }, [events, searchQuery]);

  const renderFooter = () => {
    if (!loading) { return null; }

    return (
      <View style={tw`py-4 items-center`}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  // 处理事件点击
  const handleEventPress = (event) => {
    setSelectedEvent(event);
    navigation.navigate('EventDetail');
  };

  // 渲染事件卡片
  const renderEventCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={tw`mb-4 rounded-lg overflow-hidden ${cardBg} shadow`}
        onPress={() => handleEventPress(item)}
      >
        <View style={tw`p-4`}>
          <Text style={tw`text-lg font-bold ${textColor} mb-2`}>{item.title}</Text>

          {item.eventDate && (
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="time-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={tw`${secondaryTextColor} ml-1`}>{item.eventDate}</Text>
            </View>
          )}

          {item.location && (
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="location-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={tw`${secondaryTextColor} ml-1`}>{item.location}</Text>
            </View>
          )}

          {item.organizer && (
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="people-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={tw`${secondaryTextColor} ml-1`}>{item.organizer}</Text>
            </View>
          )}

          {item.plainDescription && (
            <Text
              style={tw`${textColor} mt-2`}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.plainDescription}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold ${textColor} mb-1`}>Campus Events</Text>
        <Text style={tw`text-lg ${secondaryTextColor} mb-4`}>Upcoming Baruch Activities</Text>

        {/* 搜索框 */}
        <View style={tw`mb-4 flex-row items-center ${inputBg} rounded-lg px-3`}>
          <Ionicons name="search" size={20} color={theme.colors.secondaryText} />
          <TextInput
            style={tw`flex-1 py-2 px-2 ${textColor}`}
            placeholder="Search events..."
            placeholderTextColor={theme.colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Text style={tw`text-red-500 mb-4`}>
            Error: {error}
          </Text>
          <TouchableOpacity
            style={tw`bg-primary px-4 py-2 rounded-lg`}
            onPress={loadEvents}
          >
            <Text style={tw`text-white font-bold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item, index) => item.id || item.guid || `event-${index}`}
          contentContainerStyle={tw`px-4 pb-6`}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={loading && events.length === 0}
              onRefresh={loadEvents}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={tw`flex-1 items-center justify-center py-16`}>
                <Text style={tw`${secondaryTextColor}`}>
                  {searchQuery ? 'No matching events found' : 'No events available'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default EventsScreen;
