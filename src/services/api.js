import axios from 'axios';

const BASE_URL = 'https://baruch.campuslabs.com/engage/api/discovery/search/organizations';
const ORGANIZATION_URL = 'https://baruch.campuslabs.com/engage/organization/';

export const fetchClubs = async (skip = 0, top = 20) => {
  try {
    const response = await axios.get(BASE_URL, {
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
  return `${ORGANIZATION_URL}${websiteKey}`;
};
