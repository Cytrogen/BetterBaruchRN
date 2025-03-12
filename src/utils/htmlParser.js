export const extractLinksFromHtml = (html) => {
  if (!html) { return []; }

  const links = [];
  const linkRegex = /<a[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1].trim();
    let text = match[2].trim();

    // 移除内部HTML标签以获取纯文本
    text = text.replace(/<[^>]*>/g, '');

    if (url && url !== '#' && !url.startsWith('javascript:')) {
      // 避免重复链接
      if (!links.some(link => link.url === url)) {
        links.push({ url, text });
      }
    }
  }

  // 移除HTML标签以获取纯文本
  let plainText = html.replace(/<[^>]+>/g, ' ');
  const urlRegex = /\b(https?:\/\/[^\s]+)|(www\.[^\s]+\.[^\s]+)/gi;

  // 查找纯文本中的所有URL
  while ((match = urlRegex.exec(plainText)) !== null) {
    const url = match[0].trim();
    let validUrl = url;

    // 确保有http/https前缀
    if (validUrl.startsWith('www.')) {
      validUrl = 'https://' + validUrl;
    }

    // 去除URL末尾的标点符号
    validUrl = validUrl.replace(/[.,;:!?)]+$/, '');

    // 提取链接文本
    const startPos = Math.max(0, match.index - 30);
    const endPos = Math.min(plainText.length, match.index + url.length + 30);
    let context = plainText.substring(startPos, endPos);

    // 尝试找到“点击这里”或者类似的文本
    let text = '';
    const clickHereRegex = /(click\s+here|register|sign\s+up|join|apply)[^.!?:]*?:/i;
    const clickMatch = context.match(clickHereRegex);

    if (clickMatch) {
      text = clickMatch[0].trim();
    } else {
      // 使用附近的一些文本作为上下文
      text = 'Link: ' + validUrl.substring(0, 30) + '...';
    }

    // 避免重复链接
    if (!links.some(link => link.url === validUrl)) {
      links.push({ url: validUrl, text });
    }
  }
  return links;
};

export const createStyledTextWithLinks = (parsedText, textStyle, linkStyle, onLinkPress) => {
  if (!parsedText) { return null; }

  // 分割文本到普通文本和链接部分
  const parts = [];
  let currentText = '';
  let remainingText = parsedText;

  while (remainingText.length > 0) {
    const linkStartIndex = remainingText.indexOf('[[LINK_START:');

    if (linkStartIndex === -1) {
      // 没有更多链接
      currentText += remainingText;
      remainingText = '';
    } else {
      // 添加链接前的文本
      currentText += remainingText.substring(0, linkStartIndex);
      parts.push({ type: 'text', content: currentText });
      currentText = '';

      // 提取链接URL
      const urlEndIndex = remainingText.indexOf(']]', linkStartIndex);
      const url = remainingText.substring(linkStartIndex + 13, urlEndIndex);

      // 提取链接文本
      const textStartIndex = urlEndIndex + 2;
      const textEndIndex = remainingText.indexOf('[[LINK_END]]', textStartIndex);
      const linkText = remainingText.substring(textStartIndex, textEndIndex);

      // 添加链接部分
      parts.push({ type: 'link', url, content: linkText });

      // 更新剩余文本
      remainingText = remainingText.substring(textEndIndex + 12);
    }
  }

  // 添加最后的文本部分（如果有的话）
  if (currentText) {
    parts.push({ type: 'text', content: currentText });
  }

  return parts;
};
