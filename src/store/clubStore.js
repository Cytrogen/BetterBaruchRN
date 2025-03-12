import { create } from 'zustand';
import { fetchClubs, fetchClubDetails } from '../services/api';
import { ClubCacheService } from '../services/ClubCacheService';

const useClubStore = create((set, get) => ({
  clubs: [],
  loading: false,
  error: null,
  expandedClub: null,
  clubDetails: {},
  hasMore: true,

  // 加载社团列表
  loadClubs: async () => {
    try {
      set({ loading: true, error: null });
      const clubsData = await fetchClubs(0, 20);
      set({ clubs: clubsData, loading: false });
    } catch (error) {
      console.error('加载社团列表失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  // 加载更多社团
  loadMoreClubs: async () => {
    try {
      const { clubs, loading } = get();

      // 避免同时发起多个请求
      if (loading) {
        console.log('已有加载过程在进行中，跳过此次加载');
        return;
      }

      set({ loading: true, error: null });

      // 添加最大限制，防止无限加载
      if (clubs.length >= 500) { // 假设500是最大限制
        console.log('已达到最大加载数量');
        set({ loading: false, hasMore: false });
        return;
      }

      const moreClubs = await fetchClubs(clubs.length, 20);

      // 检查是否已经没有更多数据
      if (!moreClubs || moreClubs.length === 0) {
        console.log('没有更多社团数据');
        set({ loading: false, hasMore: false });
        return;
      }

      set({
        clubs: [...clubs, ...moreClubs],
        loading: false,
        hasMore: moreClubs.length >= 20, // 如果返回的数量少于请求的数量，说明可能没有更多数据了
      });
    } catch (error) {
      console.error('加载更多社团失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  // 设置展开的社团
  setExpandedClub: clubId => {
    set({ expandedClub: get().expandedClub === clubId ? null : clubId });
  },

  // 获取社团详情
  getClubDetails: async (clubId) => {
    try {
      if (!clubId) {
        console.error('获取社团详情失败: 无效的clubId');
        throw new Error('Invalid club ID');
      }

      const { clubDetails } = get();

      // 如果已在state中，直接返回
      if (clubDetails[clubId]) {
        // 如果是临时错误响应，并且是在<2分钟前获取的，则直接返回
        if (clubDetails[clubId].temporaryError) {
          const lastTried = clubDetails[clubId]._fetchTime || 0;
          const now = Date.now();
          // 如果上次尝试在2分钟内，直接返回临时错误，否则重试
          if (now - lastTried < 2 * 60 * 1000) {
            console.log(`临时错误响应缓存命中: ${clubId}, 跳过重试`);
            return clubDetails[clubId];
          } else {
            console.log(`临时错误响应已过期: ${clubId}, 尝试重新获取`);
            // 继续尝试获取新数据
          }
        } else {
          console.log(`从store获取社团详情: ${clubId}`);
          return clubDetails[clubId];
        }
      }

      console.log(`尝试从缓存获取社团详情: ${clubId}`);
      // 尝试从缓存获取
      const cachedDetails = await ClubCacheService.getClubDetails(clubId);
      if (cachedDetails) {
        console.log(`社团详情缓存命中: ${clubId}`);
        // 更新状态
        const updatedDetails = {
          ...get().clubDetails,
          [clubId]: {
            ...cachedDetails,
            _fetchTime: Date.now(),
          },
        };
        set({ clubDetails: updatedDetails });
        return cachedDetails;
      }

      // 添加网络超时
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error('Network request timeout after 15 seconds'));
        }, 15000);
      });

      console.log(`从API获取社团详情: ${clubId}`);
      // 从API获取，增加超时处理
      const detailsPromise = fetchClubDetails(clubId);

      // 使用Promise.race实现超时
      const details = await Promise.race([detailsPromise, timeoutPromise]);

      // 如果服务器返回了临时错误标记
      const isTemporaryError = details && details.temporaryError === true;

      if (!isTemporaryError) {
        console.log(`成功获取社团详情: ${clubId}`);

        // 保存到缓存
        await ClubCacheService.saveClubDetails(clubId, details);
      } else {
        console.log(`服务器返回临时错误响应: ${clubId}`);
        // 临时错误不保存到持久缓存
      }

      // 获取最新的state，避免覆盖
      const currentDetails = get().clubDetails;
      const newDetails = {
        ...currentDetails,
        [clubId]: {
          ...details,
          _fetchTime: Date.now(),
        },
      };

      // 更新状态
      set({ clubDetails: newDetails });

      return details;
    } catch (error) {
      console.error(`获取社团详情失败: ${error.message || '未知错误'}`, error);

      // 对于网络错误，创建临时错误响应
      const errorResponse = {
        id: clubId,
        name: '网络错误',
        websiteKey: '',
        summary: '无法连接到服务器，请检查网络连接后重试',
        profilePicture: '',
        contactInfo: { address: '', email: '', phone: '' },
        socialMedia: [],
        additionalInfo: {
          clubLocation: '',
          meetingLocation: '',
          meetingTime: '',
          meetingFrequency: '',
        },
        temporaryError: true,
        _fetchTime: Date.now(),
      };

      // 更新状态
      const currentDetails = get().clubDetails;
      set({
        clubDetails: {
          ...currentDetails,
          [clubId]: errorResponse,
        },
      });

      // 返回错误响应对象而不是抛出异常
      return errorResponse;
    }
  },

  // 清除缓存
  clearCache: async () => {
    try {
      await ClubCacheService.clearAllCache();
      set({ clubDetails: {} });
      return true;
    } catch (error) {
      console.error('清除缓存失败:', error);
      return false;
    }
  },
}));

export default useClubStore;
