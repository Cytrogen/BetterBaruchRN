import {createDebugAxios} from './networkDebug';
import * as rssParser from 'react-native-rss-parser';

const debugAxios = createDebugAxios();

export const fetchClubs = async (skip = 0, top = 20) => {
  try {
    const clubURL = 'https://baruch.campuslabs.com/engage/api/discovery/search/organizations';
    const response = await debugAxios.get(clubURL, {
      params: {
        'orderBy[0]': 'UpperName asc',
        top,
        filter: '',
        query: '',
        skip,
      },
    });
    return response.data.value;
  } catch (error) {
    console.error('获取社团列表失败：', error);
    throw error;
  }
};

export const fetchClubDetails = websiteKey => {
  try {
    return {
      websiteKey,
      onDataExtracted: data => { return data; },
    };
  } catch (error) {
    console.error('获取社团详情失败：', error);
    throw error;
  }
};

export const fetchRSSFeed = async () => {
  try {
    console.log('开始获取RSS Feed...');
    const RSSFeedURL = 'https://ktnrs.com/feeds/vkfgwjdzh7zasktc.xml';
    const response = await debugAxios.get(RSSFeedURL);

    // 获取XML字符串内容
    const xmlData = response.data;
    console.log('RSS XML数据获取成功，长度:', xmlData.length);

    // 使用RSS解析器解析XML内容
    const parsedFeed = await rssParser.parse(xmlData);
    console.log('RSS解析成功，文章数量:', parsedFeed.items.length);

    return parsedFeed;
  } catch (error) {
    console.error('获取RSS Feed失败，详细错误:', error);
    console.error('错误名称:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);

    if (error.response) {
      // 服务器响应错误
      console.error('服务器响应状态:', error.response.status);
      console.error('服务器响应头:', error.response.headers);
      console.error('服务器响应数据:', error.response.data);
    } else if (error.request) {
      // 请求发送成功但没有收到响应
      console.error('请求已发送但无响应:', error.request);
    }

    throw error;
  }
};

export const mockFetchClubDetails = async websiteKey => {
  try {
    console.log('使用模拟数据，网站键：', websiteKey);
    return {
      contactInfo: {
        address: 'One Bernard Baruch Way, Room 2-210, New York, NY 10010',
        email: `${websiteKey}@baruch.cuny.edu`,
        phone: 'This is a mock data',
      },
      socialMedia: [
        { type: 'website', url: `http://baruch.cuny.edu/${websiteKey}` },
        { type: 'instagram', url: `https://instagram.com/baruch_${websiteKey}` },
        { type: 'facebook', url: `http://facebook.com/baruch_${websiteKey}` },
        { type: 'twitter', url: `https://twitter.com/baruch_${websiteKey}` },
      ],
    };
  } catch (error) {
    console.error('获取社团详情失败：', error);
    throw error;
  }
};

export const getClubLogoUrl = (profilePicture, size = 'small-sq') => {
  if (!profilePicture) { return null; }
  return `https://se-images.campuslabs.com/clink/images/${profilePicture}?preset=${size}`;
};

export const getClubPageUrl = websiteKey => {
  const organizationURL = 'https://baruch.campuslabs.com/engage/organization/';
  return `${organizationURL}${websiteKey}`;
};
