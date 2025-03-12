import apiClient from './enhancedApiClient';

// 获取事件数据
export const fetchEventData = async (eventUrl) => {
  try {
    const response = await apiClient.get(`/api/events?url=${encodeURIComponent(eventUrl)}`);
    return response.data;
  } catch (error) {
    console.error('获取事件数据失败:', error);
    throw error;
  }
};

// 刷新事件缓存
export const refreshEventCache = async (eventUrl) => {
  try {
    const response = await apiClient.post('/api/events/refresh', { url: eventUrl });
    return response.data;
  } catch (error) {
    console.error('刷新事件缓存失败:', error);
    throw error;
  }
};

// 获取最近事件
export const fetchRecentEvents = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/api/events/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('获取最近事件失败:', error);
    throw error;
  }
};

// 获取所有的事件
export const fetchAllEvents = async () => {
  try {
    const response = await apiClient.get('/api/events/list');
    return response.data;
  } catch (error) {
    console.error('获取学校事件列表失败:', error);
    throw error;
  }
};

// 获取社团信息
export const fetchClubs = async (skip = 0, top = 20) => {
  try {
    console.log(`开始获取社团: skip=${skip}, top=${top}`);

    // 检查参数
    if (typeof skip !== 'number' || typeof top !== 'number') {
      throw new Error(`参数类型错误: skip=${typeof skip}, top=${typeof top}`);
    }

    // 添加超时和重试
    const MAX_RETRIES = 2;
    let retries = 0;
    let lastError = null;

    while (retries <= MAX_RETRIES) {
      try {
        const response = await apiClient.get('/api/clubs', {
          params: { skip, top },
          timeout: 15000,
        });

        // 验证响应
        if (!response) {
          throw new Error('API返回空响应');
        }

        if (!response.data) {
          throw new Error('API响应缺少data属性');
        }

        console.log(`成功获取社团: 获取到${response.data.length || 0}个社团`);
        return response.data;
      } catch (e) {
        lastError = e;
        retries++;

        if (retries <= MAX_RETRIES) {
          console.log(`获取社团重试 ${retries}/${MAX_RETRIES}`);
          // 等待一秒后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // 所有重试都失败了
    throw lastError;
  } catch (error) {
    // 更详细的错误日志
    console.error('获取社团列表失败:', {
      message: error.message,
      skip,
      top,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : 'No response',
      request: !!error.request,
    });

    // 如果这是API返回的空数据而不是真正的错误，返回空数组
    if (error.message && (
      error.message.includes('API返回空响应') ||
      error.message.includes('API响应缺少data属性'))) {
      console.log('API可能已经没有更多数据，返回空数组');
      return [];
    }

    throw new Error(`获取社团列表失败: ${error.message}`);
  }
};

// 获取社团详情信息
export const fetchClubDetails = async (clubId) => {
  try {
    const response = await apiClient.get(`/api/clubs/${clubId}`);
    return response.data;
  } catch (error) {
    console.error('获取社团详情失败:', error);
    throw error;
  }
};

// 获取RSS Feed
export const fetchRSSFeed = async () => {
  try {
    const response = await apiClient.get('/api/rss');
    return response.data;
  } catch (error) {
    console.error('获取RSS Feed失败:', error);
    throw error;
  }
};

export const getClubLogoUrl = (profilePicture, size = 'small-sq') => {
  if (!profilePicture) { return null; }
  return `https://se-images.campuslabs.com/clink/images/${profilePicture}?preset=${size}`;
};
