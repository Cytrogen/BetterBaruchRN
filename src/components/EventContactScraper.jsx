import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const EventContactScraper = ({ eventUrl, onContactExtracted }) => {
  const webViewRef = useRef(null);

  useEffect(() => {
    console.log('EventContactScraper: 组件已挂载，准备抓取联系人信息');
    return () => {
      console.log('EventContactScraper: 组件已卸载');
    };
  }, []);

  // 如果eventUrl不是字符串，打印警告并返回null
  if (typeof eventUrl !== 'string') {
    console.error('EventContactScraper: 无效的URL类型，必须是字符串:', eventUrl);
    // 异步调用回调以确保组件生命周期一致性
    setTimeout(() => onContactExtracted(null), 0);
    return null;
  }

  console.log('EventContactScraper: 开始抓取事件联系人信息，URL:', eventUrl);

  const injectedJavaScript = `
    console.log("JavaScript已注入抓取联系人信息的WebView");

    // 等待页面完全加载
    setTimeout(() => {
      try {
        console.log("开始在页面中查找联系人信息");
        
        // 寻找包含"Contacts"的label标签
        const contactLabels = Array.from(document.querySelectorAll('label')).filter(label => 
          label.textContent.trim() === 'Contacts'
        );
        
        console.log("找到Contact标签数量:", contactLabels.length);
        
        let contactsFound = [];
        
        if (contactLabels.length > 0) {
          // 找到包含联系人信息的父元素
          const contactLabel = contactLabels[0];
          const contactContainer = contactLabel.closest('div');
          
          if (contactContainer) {
            // 寻找所有联系人span元素
            const contactSpans = contactContainer.querySelectorAll('span[aria-label]');
            console.log("找到联系人span数量:", contactSpans.length);
            
            if (contactSpans.length > 0) {
              // 处理每个联系人
              contactSpans.forEach(span => {
                const ariaLabel = span.getAttribute('aria-label');
                // 清理名字 - 移除末尾的逗号和多余的空白
                let name = span.textContent.trim();
                // 移除末尾的逗号
                if (name.endsWith(',')) {
                  name = name.slice(0, -1).trim();
                }
                // 移除多余的空白
                name = name.replace(/\\s+/g, ' ').trim();
                
                // 从aria-label中提取电子邮件和电话
                let email = '';
                let phone = '';
                
                if (ariaLabel) {
                  const emailMatch = ariaLabel.match(/Email:\\s*([^,]+)/i);
                  const phoneMatch = ariaLabel.match(/Contact phone number:\\s*([^,\\n]+)/i);
                  
                  if (emailMatch && emailMatch[1]) {
                    email = emailMatch[1].trim();
                  }
                  
                  if (phoneMatch && phoneMatch[1]) {
                    phone = phoneMatch[1].trim();
                    if (phone === 'Not provided') {
                      phone = '';
                    }
                  }
                  
                  contactsFound.push({ name, email, phone });
                }
              });
            } else {
              // 备选方案：尝试从包含联系人信息的其他元素中提取
              const contactElements = contactContainer.querySelectorAll('.font-semibold');
              console.log("找到联系人元素数量:", contactElements.length);
              
              if (contactElements.length > 0) {
                contactElements.forEach(element => {
                  // 清理名字
                  let name = element.textContent.trim();
                  // 移除末尾的逗号
                  if (name.endsWith(',')) {
                    name = name.slice(0, -1).trim();
                  }
                  // 移除多余的空白
                  name = name.replace(/\\s+/g, ' ').trim();
                  
                  // 由于没有aria-label，我们只能获取名字
                  contactsFound.push({ name, email: '', phone: '' });
                });
              }
            }
          }
        }
        
        // 如果没有找到标准联系人信息，尝试其他方式
        if (contactsFound.length === 0) {
          // 查找可能包含联系人信息的其他元素
          document.querySelectorAll('div').forEach(div => {
            if (div.textContent.includes('Contact:') || div.textContent.includes('Organizer:')) {
              const text = div.textContent.trim();
              const nameMatch = text.match(/(Contact|Organizer):\\s*([^\\n]+)/i);
              if (nameMatch && nameMatch[2]) {
                let name = nameMatch[2].trim();
                // 移除末尾的逗号
                if (name.endsWith(',')) {
                  name = name.slice(0, -1).trim();
                }
                // 移除多余的空白
                name = name.replace(/\\s+/g, ' ').trim();
                
                contactsFound.push({ name, email: '', phone: '' });
              }
            }
          });
        }
        
        console.log("提取的联系人数量:", contactsFound.length);
        
        // 发送提取的联系人信息
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'contacts',
          data: contactsFound
        }));
      } catch (error) {
        console.error("抓取联系人信息时出错:", error.message);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    }, 3000); // 给页面3秒加载时间
    
    true; // 必需的，表示JavaScript已成功注入
  `;

  const handleMessage = (event) => {
    console.log('EventContactScraper: 收到WebView消息');
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('EventContactScraper: 消息类型:', data.type);

      if (data.type === 'contacts' && data.data) {
        console.log('EventContactScraper: 成功提取联系人信息，数量:', data.data.length);
        onContactExtracted(data.data);
      } else if (data.type === 'error') {
        console.error('EventContactScraper: 提取联系人信息失败:', data.message);
        onContactExtracted([]);
      }
    } catch (error) {
      console.error('EventContactScraper: 解析WebView返回数据错误:', error);
      onContactExtracted([]);
    }
  };

  return (
    <View style={{ height: 1, width: 1, opacity: 0 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: eventUrl }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => console.log('EventContactScraper: WebView开始加载事件页面')}
        onLoadEnd={() => console.log('EventContactScraper: WebView事件页面加载完成')}
        onError={(error) => {
          console.error('EventContactScraper: WebView加载错误:', error);
          onContactExtracted([]);
        }}
      />
    </View>
  );
};

export default EventContactScraper;
