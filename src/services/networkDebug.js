import axios from 'axios';

export const createDebugAxios = () => {
  const instance = axios.create();

  // 请求拦截器
  instance.interceptors.request.use(
    config => {
      console.log(`🚀 [网络请求] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    error => {
      console.error('❌ [网络请求错误]', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    response => {
      console.log(`✅ [网络响应] ${response.status} ${response.config.url}`, {
        headers: response.headers,
        data: response.data ? '数据长度: ' + JSON.stringify(response.data).length : 'No data',
      });
      return response;
    },
    error => {
      console.error(`❌ [网络响应错误] ${error.config?.url || 'Unknown URL'}`, {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        } : 'No response',
        request: error.request ? 'Request sent but no response' : 'Request not sent',
      });
      return Promise.reject(error);
    }
  );

  return instance;
};

export const testRSSFeed = async (url) => {
  try {
    console.log(`📡 开始测试RSS feed: ${url}`);
    const debugAxios = createDebugAxios();
    const response = await debugAxios.get(url);

    console.log('📊 RSS响应内容类型:', response.headers['content-type']);
    console.log('📝 RSS响应内容预览:', response.data.substring(0, 300) + '...');

    return {
      success: true,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    console.error('❌ RSS测试失败:', error);
    return {
      success: false,
      error: error,
    };
  }
};
