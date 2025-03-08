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
  Clipboard,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import useEventStore from '../store/eventStore';
import EventContactScraper from '../components/EventContactScraper';
import EventContactInfo from '../components/EventContactInfo';
import EventLinksPreview from '../components/EventLinksPreview';
import ClickableDescription from '../components/ClickableDescription';
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
  const [eventUrl, setEventUrl] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [shouldLoadContacts, setShouldLoadContacts] = useState(false);
  const [descriptionLinks, setDescriptionLinks] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  // const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';
  const linkColor = theme.isDark ? 'text-blue-400' : 'text-blue-600';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';

  useEffect(() => {
    if (selectedEvent) {
      console.log('事件详情页: 事件已选中，准备解析链接', selectedEvent.title);

      // 从描述中提取链接
      if (selectedEvent.detailDescription) {
        const links = extractLinksFromHtml(selectedEvent.detailDescription);
        console.log('事件详情页: 从描述中提取的链接数量:', links.length);
        setDescriptionLinks(links);
      }

      // 检查事件对象结构并提取URL
      let url = null;

      // 检查是否有links数组
      if (selectedEvent.links && Array.isArray(selectedEvent.links) && selectedEvent.links.length > 0) {
        // 从links数组中提取第一个链接的URL
        console.log('事件详情页: 从links数组中提取URL');
        const firstLink = selectedEvent.links[0];
        if (firstLink && typeof firstLink === 'object' && firstLink.url) {
          url = firstLink.url;
        }
      }
      // 如果没有找到links数组或URL，检查是否有link属性
      else if (selectedEvent.link && typeof selectedEvent.link === 'string') {
        console.log('事件详情页: 从link属性中提取URL');
        url = selectedEvent.link;
      }
      // 检查是否有guid作为后备
      else if (selectedEvent.guid && typeof selectedEvent.guid === 'string' && selectedEvent.guid.startsWith('http')) {
        console.log('事件详情页: 从guid属性中提取URL');
        url = selectedEvent.guid;
      }

      console.log('事件详情页: 提取的URL:', url);
      setEventUrl(url);

      if (url) {
        // 设置加载联系人信息
        setLoadingContacts(true);
        const contactTimer = setTimeout(() => {
          console.log('事件详情页: 开始加载WebView抓取联系人信息');
          setShouldLoadContacts(true);
        }, 1000);
        return () => {
          clearTimeout(contactTimer);
        };
      } else {
        console.log('事件详情页：没有有效的URL，无法抓取联系人信息');
      }
    }
  }, [selectedEvent]);

  // 处理联系人信息提取完成
  const handleContactExtracted = (contactsData) => {
    console.log('事件详情页: 联系人信息提取完成', contactsData ? `找到${contactsData.length}个联系人` : '失败');
    setLoadingContacts(false);
    setShouldLoadContacts(false);
    setContacts(contactsData || []);
  };

  // 处理返回按钮点击
  const handleBack = () => {
    clearSelectedEvent();
    navigation.goBack();
  };

  // 处理分享
  const handleShare = async () => {
    if (!selectedEvent) { return; }

    try {
      const eventLink = eventUrl || '';
      await Share.share({
        message: `${selectedEvent.title}\n${selectedEvent.eventDate || ''}\n${selectedEvent.location || ''}\n\n${selectedEvent.plainDescription || ''}${eventLink ? `\n\nMore info: ${eventLink}` : ''}`,
        title: selectedEvent.title,
      });
    } catch (error) {
      console.error('分享失败：', error);
    }
  };

  // 处理打开链接
  const handleOpenLink = async (url) => {
    if (!url) { return; }

    // 确保URL格式正确
    let fixedUrl = url;
    if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://') &&
      !fixedUrl.startsWith('mailto:') && !fixedUrl.startsWith('tel:')) {
      // 添加https前缀，如果没有协议
      if (fixedUrl.startsWith('www.')) {
        fixedUrl = 'https://' + fixedUrl;
      } else if (!fixedUrl.includes('://')) {
        fixedUrl = 'https://' + fixedUrl;
      }
    }

    console.log('尝试打开链接:', fixedUrl);

    try {
      await Linking.openURL(fixedUrl);
    } catch (error) {
      console.error('打开链接失败:', error);

      // 如果直接打开失败，再尝试检查是否可以打开
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            'Cannot Open Link',
            `Your device cannot open this link: ${fixedUrl}`,
            [{ text: 'OK' }]
          );
        }
      } catch (secondError) {
        console.error('链接处理第二次尝试失败：', secondError);
        Alert.alert(
          'Error',
          'There was a problem opening this link. Please try copying it manually.',
          [
            {
              text: 'Copy Link',
              onPress: () => {
                Clipboard.setString(fixedUrl);
                ToastAndroid.show('Link copied to clipboard', ToastAndroid.SHORT);
              },
            },
            {
              text: 'Cancel',
            },
          ]
        );
      }
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
      {/* WebView抓取联系人信息 */}
      {shouldLoadContacts && eventUrl && (
        <EventContactScraper
          eventUrl={eventUrl}
          onContactExtracted={handleContactExtracted}
        />
      )}

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
        {/* 事件信息 */}
        <View style={tw`p-4`}>
          <Text style={tw`text-2xl font-bold ${textColor} mb-4`}>{selectedEvent.title}</Text>

          {/* 事件类型 */}
          {selectedEvent.eventType && (
            <View style={tw`mb-6 flex-row flex-wrap`}>
              <View style={tw`bg-blue-500 rounded-full px-3 py-1`}>
                <Text style={tw`text-white`}>{selectedEvent.eventType}</Text>
              </View>
            </View>
          )}

          {/* 日期、位置、组织者信息 */}
          <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
            {selectedEvent.eventDate && (
              <View style={tw`flex-row items-center mb-3`}>
                <View style={tw`bg-blue-500 rounded-full p-2 mr-3`}>
                  <Ionicons name="time-outline" size={18} color="white" />
                </View>
                <Text style={tw`${textColor} flex-1`}>{selectedEvent.eventDate}</Text>
              </View>
            )}

            {selectedEvent.location && (
              <View style={tw`flex-row items-center mb-3`}>
                <View style={tw`bg-green-500 rounded-full p-2 mr-3`}>
                  <Ionicons name="location-outline" size={18} color="white" />
                </View>
                <Text style={tw`${textColor} flex-1`}>{selectedEvent.location}</Text>
              </View>
            )}

            {selectedEvent.organizer && (
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-purple-500 rounded-full p-2 mr-3`}>
                  <Ionicons name="people-outline" size={18} color="white" />
                </View>
                <Text style={tw`${textColor} flex-1`}>{selectedEvent.organizer}</Text>
              </View>
            )}
          </View>

          {/* 联系人信息 */}
          {loadingContacts ? (
            <View style={tw`mb-6 ${cardBg} p-4 rounded-lg items-center justify-center`}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={tw`mt-2 ${textColor}`}>Loading contact information...</Text>
            </View>
          ) : (
            <EventContactInfo contacts={contacts} />
          )}

          {/* 链接预览部分 */}
          {descriptionLinks.length > 0 && (
            <EventLinksPreview
              links={descriptionLinks}
              onLinkPress={handleOpenLink}
            />
          )}

          {/* 事件描述 */}
          {selectedEvent.detailDescription && (
            <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
              <Text style={tw`text-xl font-semibold ${textColor} mb-4`}>Event Description</Text>
              <View style={styles.descriptionContainer}>
                <ClickableDescription
                  html={selectedEvent.detailDescription}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetailScreen;
