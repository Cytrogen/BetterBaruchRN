import AsyncStorage from '@react-native-async-storage/async-storage';

export const ClubCacheService = {
  saveClubDetails: async (clubId, detailsData) => {
    try {
      const timestamp = new Date().getTime();
      const cacheEntry = {
        data: detailsData,
        timestamp,
      };

      await AsyncStorage.setItem(
        `club_details_${clubId}`,
        JSON.stringify(cacheEntry),
      );
      console.log(`成功缓存社团 ${clubId} 详情`);
      return true;
    } catch (error) {
      console.error('保存社团详情至缓存失败：', error);
      return false;
    }
  },

  getClubDetails: async (clubId) => {
    try {
      const cachedData = await AsyncStorage.getItem(`club_details_${clubId}`);

      if (!cachedData) { return null; }

      const { data, timestamp } = JSON.parse(cachedData);

      const now = new Date().getTime();
      const cacheAge = now - timestamp;
      const CACHE_TTL = 24 * 60 * 60 * 1000;  // 24小时

      if (cacheAge > CACHE_TTL) {
        console.log(`社团 ${clubId} 的缓存已过期`);
        return null;
      }

      console.log(`成功拿取社团 ${clubId} 的有效缓存`);
      return data;
    } catch (error) {
      console.error('从缓存拿取社团详情失败：', error);
      return null;
    }
  },

  clearAllCache: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const clubKeys = keys.filter(key => key.startsWith('club_details_'));
      await AsyncStorage.multiRemove(clubKeys);
      console.log('成功清除社团缓存');
      return true;
    } catch (error) {
      console.error('清除社团缓存失败：', error);
      return false;
    }
  },
};
