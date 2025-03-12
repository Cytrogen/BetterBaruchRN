import { Alert } from 'react-native';

export const handleApiError = (error, customMessage = 'An error occurred') => {
  let errorMessage = customMessage;

  if (error.response) {
    // 服务器返回错误响应
    const status = error.response.status;
    const serverMessage = error.response.data?.message || '';

    if (status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to access this resource.';
    } else if (status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    if (serverMessage) {
      errorMessage += ` (${serverMessage})`;
    }
  } else if (error.request) {
    // 请求发送成功但没有收到响应
    errorMessage = 'Network error. Please check your internet connection.';
  }

  console.error(errorMessage, error);

  // 开发环境下显示错误提示
  if (__DEV__) {
    Alert.alert('Error', errorMessage);
  }

  return errorMessage;
};
