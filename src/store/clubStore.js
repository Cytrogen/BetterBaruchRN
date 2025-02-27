import { create } from 'zustand';
import { fetchClubs } from '../services/api';

const useClubStore = create((set, get) => ({
  clubs: [],
  loading: false,
  error: null,
  expandedClub: null,
  clubDetails: {},

  // 加载社团列表
  loadClubs: async () => {
    try {
      set({ loading: true, error: null });
      const clubsData = await fetchClubs(0, 20);
      set({ clubs: clubsData, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // 加载更多社团
  loadMoreClubs: async () => {
    try {
      const { clubs } = get();
      set({ loading: true, error: null });
      const moreClubs = await fetchClubs(clubs.length, 20);
      set({ clubs: [...clubs, ...moreClubs], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // 设置展开的社团
  setExpandedClub: clubId => {
    set({ expandedClub: get().expandedClub === clubId ? null : clubId });
  },

  // 设置社团详情
  setClubDetails: (details) => {
    set({ clubDetails: details });
  },
}));

export default useClubStore;
