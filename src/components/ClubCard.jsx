import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Linking, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WebScraper from './WebScraper';
import { getClubLogoUrl, mockFetchClubDetails } from '../services/api';
import useClubStore from '../store/clubStore';
import tw from '../styles/tailwind';
import { useTheme } from '../../App';

const ClubCard = ({ club }) => {
  const { expandedClub, setExpandedClub, clubDetails, setClubDetails } = useClubStore();
  const theme = useTheme();
  const isExpanded = expandedClub === club.Id;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [scrapeProps, setScrapeProps] = useState(null);
  const [dataLoadAttempted, setDataLoadAttempted] = useState(false);
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const [localDetails, setLocalDetails] = useState(null);

  const cardStyle = theme.isDark
    ? (isExpanded ? 'dark-card-expanded' : 'dark-card')
    : (isExpanded ? 'card-expanded' : 'card');

  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-400' : 'text-gray-500';
  const contactBgColor = theme.isDark ? 'bg-gray-800' : 'bg-gray-50';

  const loadMockData = useCallback(async () => {
    try {
      const mockData = await mockFetchClubDetails(club.WebsiteKey);

      setClubDetails(prevDetails => ({
        ...prevDetails,
        [club.Id]: mockData,
      }));

      return mockData;
    } catch (error) {
      console.error('获取模拟数据失败：', error);
    }
  }, [club.WebsiteKey, club.Id, setClubDetails]);

  // 先加载模拟数据再尝试获取真实数据
  useEffect(() => {
    if (isExpanded && clubDetails[club.Id]) {
      console.log('展开后检测到club详情:', club.Id, clubDetails[club.Id]);
    }

    if (isExpanded && !clubDetails[club.Id] && !dataLoadAttempted) {
      setLoading(true);
      setDataLoadAttempted(true);

      // 立即加载模拟数据
      loadMockData().then(() => {
        console.log('已加载模拟数据，现尝试加载实际数据');

        // 然后尝试加载真实数据
        try {
          const scrapePropsObj = {
            websiteKey: club.WebsiteKey,
            onDataExtracted: data => {
              console.log('WebScraper返回数据：', JSON.stringify(data).substring(0, 100) + '...');

              // 检查数据有效性
              if (data && data.contactInfo) {
                console.log('更新前的club详情:', clubDetails[club.Id]);

                // 同时更新全局和本地状态
                setClubDetails(prevDetails => {
                  const newDetails = {
                    ...prevDetails,
                    [club.Id]: data,
                  };

                  console.log('更新后的club详情:', newDetails[club.Id]);
                  return newDetails;
                });
                setLocalDetails(data);

                console.log('已更新详细信息');
              } else {
                console.log('数据无效，结构：', data);
              }
              setLoading(false);
              setScrapingComplete(true);
            },
          };

          console.log('设置scrapeProps：', club.WebsiteKey);
          setScrapeProps(scrapePropsObj);
        } catch (error) {
          console.error('加载实际数据失败：', error);
          setLoading(false);
        }
      });
    }
  }, [isExpanded, club.Id, clubDetails, club.WebsiteKey, setClubDetails, loadMockData, dataLoadAttempted]);

  // 当卡片折叠时重置尝试状态
  useEffect(() => {
    if (!isExpanded) {
      setDataLoadAttempted(false);
      setScrapingComplete(false);
    }
  }, [isExpanded]);

  // 处理展开/折叠动画
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const logoUrl = getClubLogoUrl(club.ProfilePicture);
  const displayDetails = localDetails || clubDetails[club.Id];
  console.log('displayDetails检查:', {
    hasLocalDetails: !!localDetails,
    hasStoreDetails: !!clubDetails[club.Id],
    finalDisplay: !!displayDetails,
  });

  // 处理社交媒体点击
  const handleSocialMediaPress = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`无法打开URL: ${url}`);
      }
    });
  };

  return (
    <View style={tw`${cardStyle} my-1`}>
      {/* 仅当需要抓取时渲染 */}
      {scrapeProps && !scrapingComplete && <WebScraper {...scrapeProps} />}

      {/* 基本信息区域 */}
      <TouchableOpacity
        onPress={() => setExpandedClub(club.Id)}
        style={tw`flex-row justify-between items-center`}
      >
        <View style={tw`flex-row items-center flex-1`}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={tw`w-12 h-12 rounded-full mr-4`}
              resizeMode="cover"
            />
          ) : (
            <View style={tw`w-12 h-12 rounded-full ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} mr-4 items-center justify-center`}>
              <Text style={tw`${theme.isDark ? 'text-gray-300' : 'text-gray-500'} text-xl font-bold`}>
                {club.Name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={tw`flex-1`}>
            <Text style={tw`font-bold text-base ${textColor}`}>{club.Name}</Text>
            {!isExpanded && (
              <Text
                style={tw`text-sm ${secondaryTextColor} mt-1`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {club.Summary || 'No description'}
              </Text>
            )}
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="chevron-down" size={24} color={theme.colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      {/* 展开的详情区域 */}
      {isExpanded && (
        <View style={tw`mt-4 border-t ${theme.isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
          <Text style={tw`text-base font-bold mb-2 ${textColor}`}>Club Description</Text>
          <Text style={tw`text-sm ${secondaryTextColor} mb-4`}>{club.Summary || 'No description'}</Text>

          {loading ? (
            <View style={tw`items-center py-4`}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={tw`${secondaryTextColor} mt-2`}>Loading details...</Text>
            </View>
          ) : displayDetails ? (
            <>
              {/* 联系信息 */}
              <Text style={tw`text-base font-bold mb-2 ${textColor}`}>Contact Info</Text>
              <View style={tw`${contactBgColor} p-3 rounded-lg mb-4`}>
                {displayDetails.contactInfo.address && (
                  <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                    <Text style={tw`font-medium ${textColor}`}>Address: </Text>
                    {displayDetails.contactInfo.address}
                  </Text>
                )}
                {displayDetails.contactInfo.email && (
                  <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                    <Text style={tw`font-medium ${textColor}`}>Email: </Text>
                    {displayDetails.contactInfo.email}
                  </Text>
                )}
                {displayDetails.contactInfo.phone && (
                  <Text style={tw`text-sm ${secondaryTextColor}`}>
                    <Text style={tw`font-medium ${textColor}`}>Phone: </Text>
                    {displayDetails.contactInfo.phone}
                  </Text>
                )}
                {displayDetails.contactInfo.fax && (
                  <Text style={tw`text-sm ${secondaryTextColor}`}>
                    <Text style={tw`font-medium ${textColor}`}>Fax: </Text>
                    {displayDetails.contactInfo.fax}
                  </Text>
                )}
              </View>

              {/* 社交媒体 */}
              {displayDetails.socialMedia && displayDetails.socialMedia.length > 0 && (
                <>
                  <Text style={tw`text-base font-bold mb-2 ${textColor}`}>Social Media</Text>
                  <View style={tw`flex-row flex-wrap`}>
                    {displayDetails.socialMedia.map((media, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSocialMediaPress(media.url)}
                        style={tw`mr-4 mb-2 items-center`}
                      >
                        <Ionicons
                          name={
                            media.type === 'website' ? 'globe-outline' :
                              media.type === 'instagram' ? 'logo-instagram' :
                                media.type === 'facebook' ? 'logo-facebook' :
                                  media.type === 'twitter' ? 'logo-twitter' : 'link-outline'
                          }
                          size={24}
                          color={theme.colors.primary}
                        />
                        <Text style={tw`text-xs ${secondaryTextColor} mt-1`}>
                          {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={tw`items-center py-4`}>
              <Text style={tw`${secondaryTextColor}`}>No details available</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ClubCard;
