import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Share,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import useEventStore from '../store/eventStore';
import EventContactInfo from '../components/EventContactInfo';
import EventLinksPreview from '../components/EventLinksPreview';
import ClickableDescription from '../components/ClickableDescription';
import { fetchEventData } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { extractLinksFromHtml } from '../utils/htmlParser';
import { useTheme } from '../../App';

const styles = StyleSheet.create({
  descriptionContainer: {
    padding: 8,
    borderRadius: 8,
  },
});

const EventDetailScreen = () => {
  const { selectedEvent, clearSelectedEvent } = useEventStore();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [descriptionLinks, setDescriptionLinks] = useState([]);
  const [eventUrl, setEventUrl] = useState('');
  const theme = useTheme();
  const navigation = useNavigation();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const linkColor = theme.isDark ? 'text-blue-400' : 'text-blue-600';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';

  useEffect(() => {
    const loadEventDetails = async () => {
      if (!selectedEvent) { return; }

      setLoading(true);
      setError(null);

      try {
        // 获取事件URL
        let url = '';

        if (selectedEvent.links && selectedEvent.links.length > 0) {
          url = selectedEvent.links[0].url;
        } else if (selectedEvent.link) {
          url = selectedEvent.link;
        } else if (selectedEvent.guid && selectedEvent.guid.startsWith('http')) {
          url = selectedEvent.guid;
        } else if (selectedEvent.eventLink) {
          url = selectedEvent.eventLink;
        }

        if (!url) {
          throw new Error('No valid event URL found');
        }

        setEventUrl(url);

        // 通过API获取完整的事件详情
        const data = await fetchEventData(url);
        setEventDetails(data);

        // 设置联系人
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts);
        }

        // 提取描述中的链接
        if (data.event && data.event.description) {
          const links = extractLinksFromHtml(data.event.description);
          setDescriptionLinks(links);
        }
      } catch (err) {
        const errorMessage = handleApiError(error, 'Failed to load event details');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails().then(r => console.log('EventDetailScreen: 成功加载事件详情页'));
  }, [error, selectedEvent]);

  // 处理返回按钮点击
  const handleBack = () => {
    clearSelectedEvent();
    navigation.goBack();
  };

  // 处理分享
  const handleShare = async () => {
    if (!selectedEvent || !eventDetails) { return; }

    try {
      await Share.share({
        message: `${eventDetails.event.title}\n${eventDetails.event.eventDate || ''}\n${eventDetails.event.location || ''}\n\n${eventDetails.event.description || ''}${eventUrl ? `\n\nMore info: ${eventUrl}` : ''}`,
        title: eventDetails.event.title,
      });
    } catch (e) {
      console.error('EventDetailScreen: 分享失败：', e);
    }
  };

  // 处理打开链接
  const handleOpenLink = async (url) => {
    if (!url) { return; }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'Your device cannot open this link.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      console.error('Open link error:', e);
      Alert.alert(
        'Error',
        'There was a problem opening this link.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!selectedEvent) {
    return (
      <SafeAreaView style={tw`flex-1 ${backgroundColor} items-center justify-center`}>
        <Text style={tw`${textColor}`}>No event selected</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-primary px-4 py-2 rounded-lg`}
          onPress={handleBack}
        >
          <Text style={tw`text-white font-bold`}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      {/* 顶部导航栏 */}
      <View style={tw`p-4 flex-row items-center justify-between border-b ${theme.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <TouchableOpacity
          style={tw`p-2`}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={tw`${textColor} text-lg font-semibold`}>Event Details</Text>
        <TouchableOpacity
          style={tw`p-2`}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`pb-8`}>
        {loading ? (
          <View style={tw`p-4 items-center justify-center py-20`}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={tw`mt-4 ${textColor}`}>Loading event details...</Text>
          </View>
        ) : error ? (
          <View style={tw`p-4 items-center justify-center py-20`}>
            <Text style={tw`text-red-500 mb-4`}>{error}</Text>
            <TouchableOpacity
              style={tw`bg-primary px-4 py-2 rounded-lg`}
              onPress={() => setLoading(true)}
            >
              <Text style={tw`text-white font-bold`}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : eventDetails ? (
          <View style={tw`p-4`}>
            <Text style={tw`text-2xl font-bold ${textColor} mb-4`}>{eventDetails.event.title}</Text>

            {/* 事件类型 */}
            {eventDetails.event.eventType && (
              <View style={tw`mb-6 flex-row flex-wrap`}>
                <View style={tw`bg-blue-500 rounded-full px-3 py-1`}>
                  <Text style={tw`text-white`}>{eventDetails.event.eventType}</Text>
                </View>
              </View>
            )}

            {/* 日期、位置、组织者信息 */}
            <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
              {eventDetails.event.eventDate && (
                <View style={tw`flex-row items-center mb-3`}>
                  <View style={tw`bg-blue-500 rounded-full p-2 mr-3`}>
                    <Ionicons name="time-outline" size={18} color="white" />
                  </View>
                  <Text style={tw`${textColor} flex-1`}>{eventDetails.event.eventDate}</Text>
                </View>
              )}

              {eventDetails.event.location && (
                <View style={tw`flex-row items-center mb-3`}>
                  <View style={tw`bg-green-500 rounded-full p-2 mr-3`}>
                    <Ionicons name="location-outline" size={18} color="white" />
                  </View>
                  <Text style={tw`${textColor} flex-1`}>{eventDetails.event.location}</Text>
                </View>
              )}

              {eventDetails.event.organizer && (
                <View style={tw`flex-row items-center`}>
                  <View style={tw`bg-purple-500 rounded-full p-2 mr-3`}>
                    <Ionicons name="people-outline" size={18} color="white" />
                  </View>
                  <Text style={tw`${textColor} flex-1`}>{eventDetails.event.organizer}</Text>
                </View>
              )}
            </View>

            {/* 联系人信息 */}
            <EventContactInfo contacts={contacts} />

            {/* 链接预览部分 */}
            {descriptionLinks.length > 0 && (
              <EventLinksPreview
                links={descriptionLinks}
                onLinkPress={handleOpenLink}
              />
            )}

            {/* 事件描述 */}
            {eventDetails.event.description && (
              <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
                <Text style={tw`text-xl font-semibold ${textColor} mb-4`}>Event Description</Text>
                <View style={styles.descriptionContainer}>
                  <ClickableDescription
                    html={eventDetails.event.description}
                    textColor={textColor}
                    linkColor={linkColor}
                    onLinkPress={handleOpenLink}
                  />
                </View>
              </View>
            )}

            {/* 外部链接 */}
            {eventUrl && (
              <TouchableOpacity
                style={tw`bg-primary px-4 py-3 rounded-lg items-center mt-4`}
                onPress={() => handleOpenLink(eventUrl)}
              >
                <Text style={tw`text-white font-bold`}>View Full Event Details</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={tw`p-4 items-center justify-center py-20`}>
            <Text style={tw`${textColor}`}>No event details available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetailScreen;
