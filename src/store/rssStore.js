import { create } from 'zustand';
import { fetchRSSFeed } from '../services/api';

const useRSSStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  selectedItem: null,

  // Fetch RSS feed items
  loadRSSItems: async () => {
    try {
      console.log('RSS Store: 开始加载RSS文章');
      set({ loading: true, error: null });

      const feed = await fetchRSSFeed();
      console.log('RSS Store: 成功获取Feed数据', {
        title: feed.title,
        description: feed.description,
        itemCount: feed.items.length,
      });

      set({ items: feed.items, loading: false });
      console.log('RSS Store: 状态已更新，文章数量:', feed.items.length);
    } catch (error) {
      console.error('RSS Store: 加载RSS文章时发生错误:', error);

      // 创建更具描述性的错误消息
      let errorMessage = '加载RSS订阅失败';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      set({
        error: errorMessage,
        loading: false,
        items: [],
      });
    }
  },

  // Set selected item for detailed view
  setSelectedItem: (item) => {
    console.log('RSS Store: 设置选中的文章', item.title);
    set({ selectedItem: item });
  },

  // Clear selected item
  clearSelectedItem: () => {
    console.log('RSS Store: 清除选中的文章');
    set({ selectedItem: null });
  },
}));

export default useRSSStore;
