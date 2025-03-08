import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from '../styles/tailwind';
import { useTheme } from '../../App';

const EventContactInfo = ({ contacts }) => {
  const theme = useTheme();
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';
  const cardBg = theme.isDark ? 'bg-gray-800' : 'bg-white';

  if (!contacts || contacts.length === 0) {
    return null;
  }

  // 过滤掉可能的空联系人
  const validContacts = contacts.filter(contact => contact && contact.name);
  // 如果过滤后没有有效联系人，不显示组件
  if (validContacts.length === 0) {
    return null;
  }
  const handleEmailPress = (email) => {
    if (!email) { return; }

    try {
      Linking.openURL(`mailto:${email}`).then(r => console.log('EventContactInfo: ', r));
    } catch (error) {
      console.error('Email link error:', error);
    }
  };

  const handlePhonePress = (phone) => {
    if (!phone) { return; }

    try {
      Linking.openURL(`tel:${phone}`).then(r => console.log('EventContactInfo: ', r));
    } catch (error) {
      console.error('Phone link error:', error);
    }
  };

  return (
    <View style={tw`mb-6 ${cardBg} p-4 rounded-lg`}>
      <Text style={tw`text-xl font-semibold ${textColor} mb-4`}>Contact Information</Text>

      {contacts.map((contact, index) => (
        <View
          key={index}
          style={tw`${index > 0 ? 'mt-4 pt-4 border-t border-gray-700' : ''}`}
        >
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`bg-purple-500 rounded-full p-2 mr-3`}>
              <Ionicons name="person" size={18} color="white" />
            </View>
            <Text style={tw`${textColor} font-semibold text-lg`}>{contact.name}</Text>
          </View>

          {contact.email && (
            <TouchableOpacity
              style={tw`flex-row items-center mb-2 pl-12`}
              onPress={() => handleEmailPress(contact.email)}
            >
              <Ionicons name="mail-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={tw`${secondaryTextColor} ml-2 underline`}>{contact.email}</Text>
            </TouchableOpacity>
          )}

          {contact.phone && (
            <TouchableOpacity
              style={tw`flex-row items-center pl-12`}
              onPress={() => handlePhonePress(contact.phone)}
            >
              <Ionicons name="call-outline" size={16} color={theme.colors.secondaryText} />
              <Text style={tw`${secondaryTextColor} ml-2 underline`}>{contact.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

export default EventContactInfo;
