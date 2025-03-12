import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Linking, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getClubLogoUrl } from '../services/api';
import useClubStore from '../store/clubStore';
import tw from '../styles/tailwind';
import { useTheme } from '../../App';

const ClubCard = ({ club }) => {
  const {
    expandedClub,
    setExpandedClub,
    getClubDetails,
  } = useClubStore();
  const theme = useTheme();

  // 本地UI状态
  const isExpanded = expandedClub === club.Id;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { clubDetails } = useClubStore();
  const details = clubDetails[club.Id];
  const isTemporaryError = details?.temporaryError;

  // 旋转动画
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // 样式
  const cardStyle = theme.isDark
    ? (isExpanded ? 'dark-card-expanded' : 'dark-card')
    : (isExpanded ? 'card-expanded' : 'card');
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-400' : 'text-gray-500';
  const contactBgColor = theme.isDark ? 'bg-gray-800' : 'bg-gray-50';

  // 处理展开/折叠动画
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  // 当展开时直接获取数据
  useEffect(() => {
    // 只在展开且没有数据时加载
    if (isExpanded && !details && !isLoading) {
      console.log(`[展开]: ${club.Id}`);
      loadDetails();
    }
  }, [isExpanded, details, isLoading, retryCount]);

  // 加载详情
  const loadDetails = async () => {
    console.log(`[开始加载]: ${club.Id}`);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await getClubDetails(club.Id);

      // 即使成功获取数据，也要检查是否是临时错误响应
      if (clubDetails[club.Id]?.temporaryError) {
        console.log(`[临时错误]: Club ID: ${club.Id}`);
      } else {
        console.log(`[加载成功]: ${club.Id}`);
      }
    } catch (err) {
      console.log(`[加载失败]: ${club.Id}, 错误: ${err.message}`);
      setErrorMsg(err.message || '网络错误，请稍后再试');
    } finally {
      // 确保无论成功还是失败都设置加载状态为false
      setIsLoading(false);
    }
  };

  // 强制重新加载
  const handleRetry = () => {
    console.log(`[重试] Club ID: ${club.Id}`);
    setRetryCount(prev => prev + 1); // 触发useEffect重新执行loadDetails
  };

  // 获取Logo URL
  const logoUrl = getClubLogoUrl(club.ProfilePicture);

  // 社交媒体点击处理
  const handleLinkPress = (type, url) => {
    if (!url) { return; }

    Linking.openURL(url).catch(err => {
      console.error(`无法打开链接: ${url}`, err);
      Alert.alert('错误', '无法打开链接');
    });
  };

  // 渲染临时错误状态
  const renderTemporaryError = () => (
    <View style={tw`items-center py-6 px-4`}>
      <Ionicons
        name="cloud-offline-outline"
        size={50}
        color={theme.isDark ? '#f87171' : '#ef4444'}
      />
      <Text style={tw`${textColor} text-lg font-semibold mt-4 text-center`}>
        数据源暂时不可用
      </Text>
      <Text style={tw`${secondaryTextColor} mt-2 text-center mb-4`}>
        我们暂时无法连接到社团数据源。请稍后再试。
      </Text>
      <TouchableOpacity
        style={tw`mt-2 bg-primary px-5 py-2 rounded-lg`}
        onPress={handleRetry}
      >
        <Text style={tw`text-white font-medium`}>重试</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tw`${cardStyle} my-1`}>
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

          {/* 调试信息 */}
          {/*{__DEV__ && (*/}
          {/*  <View style={tw`p-2 mb-2 ${theme.isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded`}>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>ID: {club.Id}</Text>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>Loading: {isLoading ? 'Yes' : 'No'}</Text>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>Has Details: {details ? 'Yes' : 'No'}</Text>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>Temporary Error: {isTemporaryError ? 'Yes' : 'No'}</Text>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>Error: {errorMsg || 'None'}</Text>*/}
          {/*    <Text style={tw`${textColor} text-xs`}>Retry Count: {retryCount}</Text>*/}
          {/*  </View>*/}
          {/*)}*/}

          {/* 加载状态 */}
          {isLoading ? (
            <View style={tw`items-center py-4`}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={tw`${secondaryTextColor} mt-2`}>Loading details...</Text>
            </View>
          ) : isTemporaryError ? (
            // 临时错误状态
            renderTemporaryError()
          ) : errorMsg ? (
            // 普通错误状态
            <View style={tw`items-center py-4`}>
              <Text style={tw`text-red-500 text-center mb-2`}>{errorMsg}</Text>
              <TouchableOpacity
                style={tw`mt-2 bg-primary px-3 py-1 rounded`}
                onPress={handleRetry}
              >
                <Text style={tw`text-white`}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : details ? (
            // 详情内容
            <>
              {/* 联系信息 */}
              <Text style={tw`text-base font-bold mb-2 ${textColor}`}>Contact Info</Text>
              <View style={tw`${contactBgColor} p-3 rounded-lg mb-4`}>
                {details.contactInfo?.address && (
                  <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                    <Text style={tw`font-medium ${textColor}`}>Address: </Text>
                    {details.contactInfo.address}
                  </Text>
                )}
                {details.contactInfo?.email && (
                  <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                    <Text style={tw`font-medium ${textColor}`}>Email: </Text>
                    {details.contactInfo.email}
                  </Text>
                )}
                {details.contactInfo?.phone && (
                  <Text style={tw`text-sm ${secondaryTextColor}`}>
                    <Text style={tw`font-medium ${textColor}`}>Phone: </Text>
                    {details.contactInfo.phone}
                  </Text>
                )}

                {(!details.contactInfo?.address && !details.contactInfo?.email && !details.contactInfo?.phone) && (
                  <Text style={tw`text-sm ${secondaryTextColor} italic`}>No contact information available</Text>
                )}
              </View>

              {/* 社交媒体 */}
              {details.socialMedia && details.socialMedia.length > 0 && (
                <>
                  <Text style={tw`text-base font-bold mb-2 ${textColor}`}>Social Media</Text>
                  <View style={tw`flex-row flex-wrap`}>
                    {details.socialMedia.map((media, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleLinkPress(media.type, media.url)}
                        style={tw`mr-4 mb-2 items-center`}
                      >
                        <Ionicons
                          name={
                            media.type === 'website' ? 'globe-outline' :
                              media.type === 'instagram' ? 'logo-instagram' :
                                media.type === 'facebook' ? 'logo-facebook' :
                                  media.type === 'linkedin' ? 'logo-linkedin' :
                                    media.type === 'youtube' ? 'logo-youtube' :
                                      media.type === 'twitter' ? 'logo-twitter' :
                                        'link-outline'
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

              {/* 额外信息 */}
              {details.additionalInfo && (
                Object.values(details.additionalInfo).some(val => val) && (
                  <>
                    <Text style={tw`text-base font-bold mb-2 mt-4 ${textColor}`}>Additional Info</Text>
                    <View style={tw`${contactBgColor} p-3 rounded-lg`}>
                      {details.additionalInfo.clubLocation && (
                        <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                          <Text style={tw`font-medium ${textColor}`}>Club Location: </Text>
                          {details.additionalInfo.clubLocation}
                        </Text>
                      )}
                      {details.additionalInfo.meetingLocation && (
                        <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                          <Text style={tw`font-medium ${textColor}`}>Meeting Location: </Text>
                          {details.additionalInfo.meetingLocation}
                        </Text>
                      )}
                      {details.additionalInfo.meetingTime && (
                        <Text style={tw`text-sm ${secondaryTextColor} mb-1`}>
                          <Text style={tw`font-medium ${textColor}`}>Meeting Time: </Text>
                          {details.additionalInfo.meetingTime}
                        </Text>
                      )}
                      {details.additionalInfo.meetingFrequency && (
                        <Text style={tw`text-sm ${secondaryTextColor}`}>
                          <Text style={tw`font-medium ${textColor}`}>Meeting Frequency: </Text>
                          {details.additionalInfo.meetingFrequency}
                        </Text>
                      )}
                    </View>
                  </>
                )
              )}
            </>
          ) : (
            // 无数据状态
            <View style={tw`items-center py-4`}>
              <Text style={tw`${secondaryTextColor}`}>No details available</Text>
              <TouchableOpacity
                style={tw`mt-2 bg-primary px-3 py-1 rounded`}
                onPress={handleRetry}
              >
                <Text style={tw`text-white`}>Load Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ClubCard;
