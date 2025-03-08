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

export const fetchSchoolEvents = async () => {
  try {
    console.log('开始获取学校事件...');
    const eventsRSSURL = 'https://baruch.event.cuny.edu/xml/upcoming';

    const response = await debugAxios.get(eventsRSSURL);
    const xmlData = response.data;
    console.log('事件XML数据获取成功，长度:', xmlData.length);

    // 使用RSS解析器解析XML内容
    const parsedFeed = await rssParser.parse(xmlData);
    console.log('事件解析成功，数量:', parsedFeed.items.length);

    if (parsedFeed.items.length > 0) {
      const firstItem = parsedFeed.items[0];
      console.log('示例事件标题:', firstItem.title);
      console.log('示例事件links数组:', firstItem.links ? `数量: ${firstItem.links.length}` : 'No links array');

      if (firstItem.links && firstItem.links.length > 0) {
        console.log('第一个链接结构:', JSON.stringify(firstItem.links[0]));
      }

      console.log('示例事件link属性:', firstItem.link || 'No link property');
      console.log('示例事件guid:', firstItem.id || firstItem.guid || 'No ID');
    }

    return parsedFeed.items.map(event => {
      // 尝试从描述中提取地点、时间等信息
      const description = event.description || '';

      // 确保事件有一个直接链接属性用于导航
      let eventLink = '';
      if (event.links && Array.isArray(event.links) && event.links.length > 0) {
        const firstLink = event.links[0];
        if (firstLink && typeof firstLink === 'object' && firstLink.url) {
          eventLink = firstLink.url;
        }
      } else if (event.link && typeof event.link === 'string') {
        eventLink = event.link;
      } else if (event.guid && typeof event.guid === 'string' && event.guid.startsWith('http')) {
        eventLink = event.guid;
      }

      // 提取日期时间
      let eventDate = '';
      const dateMatch = description.match(/Date:(.*?)(?=<\/div>)/i);
      if (dateMatch && dateMatch[1]) {
        eventDate = dateMatch[1].trim();
      }

      // 提取地点
      let location = 'Location not specified';
      const locationMatch = description.match(/Location:(.*?)(?=<\/div>)/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
        // 检查是否有Location not provided
        if (location.includes('not provided')) {
          location = 'Location not specified';
        }
      }

      // 提取组织者
      let organizer = '';
      const organizerMatch = description.match(/Organizer:(.*?)(?=<\/div>)/i);
      if (organizerMatch && organizerMatch[1]) {
        organizer = organizerMatch[1].trim();
      }

      // 提取类型
      let eventType = '';
      const typeMatch = description.match(/Type:(.*?)(?=<\/div>)/i);
      if (typeMatch && typeMatch[1]) {
        eventType = typeMatch[1].trim();
      }

      // 详细描述
      let detailDescription = '';
      const detailMatch = description.match(/<p>(.*?)(?=<\/p>)/is);
      if (detailMatch && detailMatch[1]) {
        detailDescription = detailMatch[1].trim();
      }

      // 格式化详细描述为支持换行的文本
      let formattedDescription = detailDescription
        .replace(/<br\s*\/?>/gi, '\n') // 替换<br>标签为换行
        .replace(/<\/p>\s*<p>/gi, '\n\n') // 段落之间添加双换行
        .replace(/-\s+/g, '• '); // 把-列表项改为•

      // 获取纯文本描述、移除HTML标签
      let plainDescription = formattedDescription.replace(/<[^>]+>/g, ' ').trim();
      plainDescription = plainDescription.replace(/\s+/g, ' ');

      return {
        ...event,
        eventDate,
        location,
        organizer,
        eventType,
        detailDescription,
        plainDescription,
        eventLink,
      };
    });
  } catch (error) {
    console.error('获取学校事件失败，详细错误:', error);
    console.error('错误名称:', error.name);
    console.error('错误消息:', error.message);

    if (error.response) {
      console.error('服务器响应状态:', error.response.status);
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
