import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import tw from '../styles/tailwind';
import ClubCard from '../components/ClubCard';
import useClubStore from '../store/clubStore';
import { useTheme } from '../../App';

const ClubListScreen = () => {
  const { clubs, loading, error, loadClubs, loadMoreClubs } = useClubStore();
  const theme = useTheme();

  const backgroundColor = theme.isDark ? 'bg-gray-900' : 'bg-background';
  const textColor = theme.isDark ? 'text-white' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-300' : 'text-primary';

  useEffect(() => {
    loadClubs().then(r => console.log('初始化加载社团成功'));
  }, [loadClubs]);

  const renderFooter = () => {
    if (!loading) { return null; }

    return (
      <View style={tw`py-4 items-center`}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  // 渲染社团卡片
  const renderClubCard = ({ item }) => <ClubCard club={ item } />;

  // 刷新处理
  const handleRefresh = () => {
    loadClubs().then(r => console.log('刷新后加载社团成功'));
  };

  // 加载更多处理
  const handleLoadMore = () => {
    if (!loading) {
      loadMoreClubs().then(r => console.log('加载更多后处理更多社团成功'));
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 ${backgroundColor}`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold ${textColor} mb-1`}>BetterBaruch - RN</Text>
        <Text style={tw`text-lg ${secondaryTextColor} mb-4`}>Campus Clubs</Text>
      </View>

      {error ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Text style={tw`text-red-500 mb-4`}>
            Error: {error}
          </Text>
          <TouchableOpacity
            style={tw`bg-primary px-4 py-2 rounded-lg`}
            onPress={loadClubs}
          >
            <Text style={tw`text-white font-bold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clubs}
          renderItem={renderClubCard}
          keyExtractor={(item) => item.Id}
          contentContainerStyle={tw`px-4 pb-6`}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={loading && clubs.length === 0}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <View style={tw`flex-1 items-center justify-center py-16`}>
                <Text style={tw`${secondaryTextColor}`}>No clubs found</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ClubListScreen;
