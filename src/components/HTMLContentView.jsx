import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../App';

const HTMLContentView = ({ html, style = {}, onLinkPress }) => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 0;
            margin: 0;
            color: ${theme.isDark ? '#FFFFFF' : '#000000'};
            background-color: ${theme.isDark ? '#121212' : '#FFFFFF'};
            font-size: 16px;
            line-height: 1.5;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          a {
            color: ${theme.colors.primary};
            text-decoration: none;
          }
        </style>
        <title>Rally Nexus</title>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // 处理链接点击
  const handleNavigationStateChange = (event) => {
    if (event.url !== 'about:blank' && onLinkPress) {
      onLinkPress(event.url);
      return false;
    }
    return true;
  };

  // 注入JavaScript以获取内容高度
  const injectedJavaScript = `
    window.ReactNativeWebView.postMessage(
      Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight
      )
    );
    // 在所有链接上阻止默认行为，并通过postMessage发送链接URL
    document.addEventListener('click', function(e) {
      if(e.target.tagName === 'A') {
        e.preventDefault();
        window.ReactNativeWebView.postMessage('link:' + e.target.href);
        return false;
      }
    }, true);
    true;
  `;

  // 处理WebView消息
  const handleMessage = (event) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('link:')) {
      const url = message.substring(5);
      if (onLinkPress) {
        onLinkPress(url);
      }
    } else {
      // 假设消息是高度
      const height = parseInt(message, 10);
      if (!isNaN(height) && style.height !== height) {
        style = { ...style, height };
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: '' }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        scrollEnabled={false}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
      />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    minHeight: 20,
  },
  webview: {
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HTMLContentView;
