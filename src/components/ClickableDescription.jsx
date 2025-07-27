import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../styles/tailwind';
import { createStyledTextWithLinks } from '../utils/htmlParser';

const ClickableDescription = ({
                                html,
                                textColor = 'text-gray-800',
                                linkColor = 'text-blue-500',
                                onLinkPress,
                              }) => {
  if (!html) { return null; }

  // 解析HTML获取处理后的文本
  const parsedText = parseHtmlDescription(html);

  // 获取文本段落和链接
  const textParts = createStyledTextWithLinks(
    parsedText,
    tw`${textColor}`,
    tw`${linkColor} underline`,
    onLinkPress
  );

  // 如果没有内容可显示，返回null
  if (!textParts || textParts.length === 0) { return null; }

  // 处理段落和列表项
  const formattedParagraphs = [];
  let currentParagraph = [];
  let previousWasText = false;

  textParts.forEach((part, index) => {
    const lines = part.content.split('\n');

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        // 新行开始，添加前一个段落
        if (currentParagraph.length > 0) {
          formattedParagraphs.push(
            <View key={formattedParagraphs.length} style={tw`mb-3`}>
              <Text>{currentParagraph}</Text>
            </View>
          );
          currentParagraph = [];
        }
      }

      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('•')) {
        // 处理列表项
        const bulletContent = trimmedLine.substring(1).trim();
        if (bulletContent) {
          if (part.type === 'text') {
            currentParagraph.push(
              <View key={`bullet-${index}-${lineIndex}`} style={tw`flex-row mb-1`}>
                <Text style={tw`${textColor} mr-2`}>•</Text>
                <Text style={tw`${textColor} flex-1`}>{bulletContent}</Text>
              </View>
            );
          } else if (part.type === 'link') {
            currentParagraph.push(
              <View key={`bullet-link-${index}-${lineIndex}`} style={tw`flex-row mb-1`}>
                <Text style={tw`${textColor} mr-2`}>•</Text>
                <TouchableOpacity
                  style={tw`flex-1`}
                  onPress={() => onLinkPress(part.url)}
                >
                  <Text style={tw`${linkColor} underline`}>{bulletContent}</Text>
                </TouchableOpacity>
              </View>
            );
          }
        }
      } else if (trimmedLine) {
        // 普通文本或链接
        if (part.type === 'text') {
          currentParagraph.push(
            <Text key={`text-${index}-${lineIndex}`} style={tw`${textColor}`}>
              {previousWasText ? ' ' : ''}{trimmedLine}
            </Text>
          );
          previousWasText = true;
        } else if (part.type === 'link') {
          currentParagraph.push(
            <TouchableOpacity
              key={`link-${index}-${lineIndex}`}
              onPress={() => onLinkPress(part.url)}
            >
              <Text style={tw`${linkColor} underline`}>
                {previousWasText ? ' ' : ''}{trimmedLine}
              </Text>
            </TouchableOpacity>
          );
          previousWasText = true;
        }
      }
    });
  });

  // 添加最后一个段落
  if (currentParagraph.length > 0) {
    formattedParagraphs.push(
      <View key={formattedParagraphs.length} style={tw`mb-2`}>
        <Text>{currentParagraph}</Text>
      </View>
    );
  }

  return (
    <View>
      {formattedParagraphs}
    </View>
  );
};

export default ClickableDescription;
