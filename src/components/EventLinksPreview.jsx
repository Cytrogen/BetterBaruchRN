import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import { useTheme } from '../../App';

const styles = StyleSheet.create({
  linkCard: {
    minWidth: 200,
    maxWidth: 200,
  },
  linkTextContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});

const EventLinksPreview = ({ links, onLinkPress }) => {
  const theme = useTheme();
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';
  const linkBg = theme.isDark ? 'bg-gray-700' : 'bg-blue-50';

  if (!links || links.length === 0) { return null; }

  // 获取链接图标
  const getLinkIcon = (url) => {
    if (!url) { return 'link'; }

    if (url.includes('forms.gle') || url.includes('docs.google.com/forms') || url.includes('forms.office.com')) {
      return 'document-text';
    } else if (url.includes('zoom.us') || url.includes('teams.microsoft.com')) {
      return 'videocam';
    } else if (url.includes('eventbrite') || url.includes('ticketmaster') || url.includes('register')) {
      return 'ticket';
    } else if (url.includes('instagram') || url.includes('facebook') || url.includes('twitter') || url.includes('linkedin')) {
      return 'logo-' + (url.includes('instagram') ? 'instagram' : url.includes('facebook') ? 'facebook' : url.includes('twitter') ? 'twitter' : 'linkedin');
    }

    return 'open-outline';
  };

  // 获取友好的链接文本
  const getLinkText = (url, text) => {
    if (text && text.length < 50) { return text; }

    // 如果文本太长或没有文本，创建友好的链接描述
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname.replace('www.', '');

      // 识别常见的链接类型
      if (domain.includes('forms.gle') || url.includes('docs.google.com/forms')) {
        return 'Google Form Registration';
      } else if (domain.includes('forms.office.com')) {
        return 'Microsoft Form Registration';
      } else if (domain.includes('zoom.us')) {
        return 'Zoom Meeting Link';
      } else if (domain.includes('teams.microsoft.com')) {
        return 'Teams Meeting Link';
      } else if (domain.includes('eventbrite')) {
        return 'Eventbrite Registration';
      } else if (domain.includes('ticketmaster')) {
        return 'Ticketmaster Purchase';
      } else if (url.includes('register') || url.includes('signup')) {
        return 'Registration Link';
      }

      // 默认显示域名
      return `Visit ${domain}`;
    } catch {
      return 'External Link';
    }
  };

  return (
    <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
      <Text style={tw`text-xl font-semibold ${textColor} mb-4`}>Quick Links</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`pb-2`}
      >
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={[
              tw`mr-3 p-3 ${linkBg} rounded-lg flex-row items-center`,
              styles.linkCard,
            ]}
            onPress={() => onLinkPress(link.url)}
          >
            <View style={tw`bg-blue-500 p-2 rounded-full mr-3`}>
              <Ionicons name={getLinkIcon(link.url)} size={20} color="white" />
            </View>
            <View style={styles.linkTextContainer}>
              <Text
                style={tw`${textColor} font-medium`}
                numberOfLines={1}
              >
                {getLinkText(link.url, link.text)}
              </Text>
              <Text
                style={tw`${secondaryTextColor} text-xs mt-1`}
                numberOfLines={1}
              >
                {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EventLinksPreview;
