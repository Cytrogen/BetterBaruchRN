import React, { useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const WebScraper = ({ url, onDataExtracted, websiteKey }) => {
  const webViewRef = useRef(null);

  console.log('WebScraper渲染，websiteKey：', websiteKey);

  // 在网页加载后执行JS代码
  const injectedJavaScript = `
    console.log("JavaScript已注入WebView");

    // 等待页面完全加载
    setTimeout(() => {
      try {
        // 获取联系信息元素
        const contactInfoElement = document.querySelector('div[style*="margin-left: 5px; padding: 5px 15px; border-left: 1px solid"]');
        
        // 解析联系信息
        let contactInfo = {
          address: '',
          email: '',
          phone: '',
          fax: ''
        };
        
        if (contactInfoElement) {
          // 提取地址
          const addressDiv = contactInfoElement.querySelector('div:first-child');
          if (addressDiv) {
            const addressLines = Array.from(addressDiv.querySelectorAll('div'))
              .map(div => div.textContent.trim())
              .filter(text => text);
            contactInfo.address = addressLines.join(', ');
          }
          
          // 提取邮箱
          const emailDiv = contactInfoElement.querySelector('div:nth-child(2)');
          if (emailDiv) {
            const emailText = emailDiv.textContent.trim();
            const emailMatch = emailText.match(/E:\\s*(.+)/);
            if (emailMatch && emailMatch[1]) {
              contactInfo.email = emailMatch[1].trim();
            }
          }
          
          // 提取电话
          const phoneDiv = contactInfoElement.querySelector('div:nth-child(3)');
          if (phoneDiv) {
            const phoneText = phoneDiv.textContent.trim();
            const phoneMatch = phoneText.match(/P:\\s*(.+)/);
            if (phoneMatch && phoneMatch[1]) {
              contactInfo.phone = phoneMatch[1].trim();
            }
          }
          
          // 提取传真
          const faxDiv = contactInfoElement.querySelector('div:nth-child(4)');
          if (faxDiv) {
            const faxText = faxDiv.textContent.trim();
            const faxMatch = faxText.match(/F:\\s*(.+)/);
            if (faxMatch && faxMatch[1]) {
              contactInfo.fax = faxMatch[1].trim();
            }
          }
        }
        
        // 获取社交媒体元素
        const socialMediaContainer = document.querySelector('#react-app > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div > div:nth-child(4)');
        
        let socialMedia = [];
        
        if (socialMediaContainer) {
          // 获取所有社交媒体链接
          const socialLinks = socialMediaContainer.querySelectorAll('a');
          
          socialLinks.forEach(link => {
            const url = link.getAttribute('href');
            const iconElement = link.querySelector('.fa');
            
            if (url && iconElement) {
              const iconClass = iconElement.className;
              let type = 'other';
              
              if (iconClass.includes('globe')) {
                type = 'website';
              } else if (iconClass.includes('instagram')) {
                type = 'instagram';
              } else if (iconClass.includes('facebook')) {
                type = 'facebook';
              } else if (iconClass.includes('twitter')) {
                type = 'twitter';
              }
              
              socialMedia.push({ type, url });
            }
          });
        }
        
        // 发送提取的数据回React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({
          contactInfo,
          socialMedia
        }));
        
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: error.message
        }));
      }
    }, 3000); // 给页面3秒加载时间
    
    true; // 注：这是必需的，表示JavaScript已成功注入
  `;

  // 处理WebView消息事件
  const handleMessage = (event) => {
    console.log('WebView发送消息：', event.nativeEvent.data.substring(0, 100) + '...');
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) {
        console.error('WebView抓取错误:', data.error);
        // 提供一些默认或部分数据
        onDataExtracted({
          contactInfo: {
            address: 'Null',
            email: 'Null',
            phone: 'Null',
          },
          socialMedia: [],
        });
      } else {
        console.log('成功提取数据：', JSON.stringify(data).substring(0, 100) + '...');
        onDataExtracted(data);
      }
    } catch (error) {
      console.error('解析WebView数据错误：', error);
      onDataExtracted({
        contactInfo: { address: '数据解析错误', email: '', phone: '' },
        socialMedia: [],
      });
    }
  };

  return (
    <View style={{ height: 0, width: 0, opacity: 0 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: `https://baruch.campuslabs.com/engage/organization/${websiteKey}` }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => console.log('WebView开始加载页面：', websiteKey)}
        onLoadEnd={() => console.log('WebView页面加载完成：', websiteKey)}
        onError={(error) => {
          console.error('WebView加载错误：', error);
          onDataExtracted({
            contactInfo: {
              address: '加载页面失败',
              email: '',
              phone: '',
            },
            socialMedia: [],
          });
        }}
      />
    </View>
  );
};

export default WebScraper;
