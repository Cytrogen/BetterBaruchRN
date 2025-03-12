import { create } from 'zustand';
import { fetchAllEvents } from '../services/api';

const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,

  // 加载学校事件列表
  loadEvents: async () => {
    try {
      console.log('事件Store: 开始加载学校事件');
      set({ loading: true, error: null });

      const eventsData = await fetchAllEvents();
      console.log('事件Store: 成功获取事件数据，数量:', eventsData.length);

      set({ events: eventsData, loading: false });
    } catch (error) {
      console.error('事件Store: 加载事件时发生错误:', error);

      let errorMessage = 'Failed to load campus events';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      set({
        error: errorMessage,
        loading: false,
        events: [],
      });
    }
  },

  // 选择事件进行详细查看
  setSelectedEvent: (event) => {
    console.log('事件Store: 设置选中的事件', event ? event.title : 'null');
    set({ selectedEvent: event });
  },

  // 清除选中的事件
  clearSelectedEvent: () => {
    console.log('事件Store: 清除选中的事件');
    set({ selectedEvent: null });
  },

  // 按类别过滤事件
  getEventsByCategory: (category) => {
    const { events } = get();
    if (!category) { return events; }

    return events.filter(event =>
      event.categories &&
      event.categories.some(cat =>
        cat.name.toLowerCase().includes(category.toLowerCase())
      )
    );
  },
}));

export default useEventStore;
