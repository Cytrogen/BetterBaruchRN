import axios from 'axios';
import getEnvVars from '../config/env';
import { apiLoadingState } from '../components/ApiLoadingIndicator';

const { apiUrl: API_BASE_URL, apiKey: API_KEY } = getEnvVars();
console.log(`API Base URL: ${API_BASE_URL}`);
const DEBOUNCE_TIME = 300;
const pendingRequests = new Map();

const getRequestKey = (config) => {
  const { url, method, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

apiClient.interceptors.request.use(
  config => {
    apiLoadingState.startLoading();

    // 生成请求标识符
    const requestKey = getRequestKey(config);

    // 如果存在相同的请求正在进行中
    if (pendingRequests.has(requestKey)) {
      const controller = new AbortController();
      config.signal = controller.signal;

      // 取消当前请求，并复用正在进行的相同请求
      controller.abort('重复请求已取消');

      // 延长现有请求的超时时间
      const pendingRequest = pendingRequests.get(requestKey);
      pendingRequest.expirationTime = Date.now() + DEBOUNCE_TIME;

      return Promise.reject({
        isDebounced: true,
        requestKey,
        promise: pendingRequest.promise,
      });
    }

    // 创建取消令牌
    const controller = new AbortController();
    config.signal = controller.signal;

    // 存储当前请求信息
    const requestInfo = {
      controller,
      expirationTime: Date.now() + DEBOUNCE_TIME,
      promise: null, // 将在响应拦截器中设置
    };

    pendingRequests.set(requestKey, requestInfo);

    // 设置清理定时器
    setTimeout(() => {
      if (pendingRequests.has(requestKey) &&
        Date.now() > pendingRequests.get(requestKey).expirationTime) {
        pendingRequests.delete(requestKey);
      }
    }, DEBOUNCE_TIME + 100);

    return config;
  },
  error => {
    apiLoadingState.endLoading();
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    apiLoadingState.endLoading();

    // 获取请求标识符
    const requestKey = getRequestKey(response.config);

    // 保存响应，然后移除请求记录
    if (pendingRequests.has(requestKey)) {
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, DEBOUNCE_TIME);
    }

    return response;
  },
  error => {
    apiLoadingState.endLoading();

    // 处理被防抖取消的请求
    if (error.isDebounced) {
      // 返回之前存储的Promise
      return error.promise;
    }

    // 处理普通错误
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message);
    } else {
      console.error('请求错误:', error);

      // 如果有请求配置，清理请求记录
      if (error.config) {
        const requestKey = getRequestKey(error.config);
        pendingRequests.delete(requestKey);
      }
    }

    return Promise.reject(error);
  }
);

const enhancedApiClient = {
  async get(url, config = {}) {
    try {
      return await apiClient.get(url, config);
    } catch (error) {
      if (error.isDebounced) {
        return error.promise;
      }
      throw error;
    }
  },
  async post(url, data, config = {}) {
    try {
      return await apiClient.post(url, data, config);
    } catch (error) {
      if (error.isDebounced) {
        return error.promise;
      }
      throw error;
    }
  },
  async put(url, data, config = {}) {
    try {
      return await apiClient.put(url, data, config);
    } catch (error) {
      if (error.isDebounced) {
        return error.promise;
      }
      throw error;
    }
  },
  async delete(url, config = {}) {
    try {
      return await apiClient.delete(url, config);
    } catch (error) {
      if (error.isDebounced) {
        return error.promise;
      }
      throw error;
    }
  },
};

export default enhancedApiClient;
