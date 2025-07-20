// YouTube API service for checking channel monetization

export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  thumbnail: string;
  customUrl?: string;
}

export interface MonetizationData {
  isMonetized: boolean;
  adsEnabled: boolean;
  membershipEnabled: boolean;
  superChatEnabled: boolean;
  estimatedRevenue?: string;
}

export interface ChannelAnalysis {
  channel: YouTubeChannelData;
  monetization: MonetizationData;
  lastChecked: string;
}

class YouTubeAPIService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    // В реальном проекте API ключ должен храниться в environment variables
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
  }

  // Извлечение ID канала из различных форматов YouTube URL
  extractChannelId(url: string): { id: string; type: 'channel' | 'user' | 'handle' } | null {
    const patterns = [
      // youtube.com/channel/UC...
      { regex: /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/, type: 'channel' as const },
      // youtube.com/c/channelname
      { regex: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'user' as const },
      // youtube.com/user/username
      { regex: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'user' as const },
      // youtube.com/@handle
      { regex: /youtube\.com\/@([a-zA-Z0-9_-]+)/, type: 'handle' as const },
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return { id: match[1], type: pattern.type };
      }
    }

    return null;
  }

  // Получение данных канала по ID
  async getChannelData(channelId: string): Promise<YouTubeChannelData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Канал не найден');
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;

      return {
        id: channel.id,
        title: snippet.title,
        description: snippet.description,
        subscriberCount: this.formatNumber(statistics.subscriberCount || '0'),
        viewCount: this.formatNumber(statistics.viewCount || '0'),
        videoCount: statistics.videoCount || '0',
        thumbnail: snippet.thumbnails?.medium?.url || '',
        customUrl: snippet.customUrl,
      };
    } catch (error) {
      console.error('Error fetching channel data:', error);
      throw error;
    }
  }

  // Получение данных канала по имени пользователя или handle
  async getChannelByUsername(username: string, type: 'user' | 'handle'): Promise<YouTubeChannelData> {
    try {
      let url = '';
      
      if (type === 'user') {
        url = `${this.baseUrl}/channels?part=snippet,statistics&forUsername=${username}&key=${this.apiKey}`;
      } else {
        // Для handles нужно использовать поиск
        url = `${this.baseUrl}/search?part=snippet&type=channel&q=${username}&key=${this.apiKey}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Канал не найден');
      }

      if (type === 'handle') {
        // Для поиска нужно получить полные данные канала
        const channelId = data.items[0].snippet.channelId;
        return await this.getChannelData(channelId);
      } else {
        // Для username данные уже полные
        const channel = data.items[0];
        const snippet = channel.snippet;
        const statistics = channel.statistics;

        return {
          id: channel.id,
          title: snippet.title,
          description: snippet.description,
          subscriberCount: this.formatNumber(statistics.subscriberCount || '0'),
          viewCount: this.formatNumber(statistics.viewCount || '0'),
          videoCount: statistics.videoCount || '0',
          thumbnail: snippet.thumbnails?.medium?.url || '',
          customUrl: snippet.customUrl,
        };
      }
    } catch (error) {
      console.error('Error fetching channel by username:', error);
      throw error;
    }
  }

  // Анализ монетизации канала
  async analyzeMonetization(channelId: string): Promise<MonetizationData> {
    try {
      // Получаем последние видео канала для анализа
      const videosResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(`YouTube API error: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();
      const videoIds = videosData.items?.map((item: any) => item.id.videoId).join(',') || '';

      if (!videoIds) {
        return {
          isMonetized: false,
          adsEnabled: false,
          membershipEnabled: false,
          superChatEnabled: false,
        };
      }

      // Получаем детальную информацию о видео
      const videoDetailsResponse = await fetch(
        `${this.baseUrl}/videos?part=contentDetails,status&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videoDetailsResponse.ok) {
        throw new Error(`YouTube API error: ${videoDetailsResponse.status}`);
      }

      const videoDetailsData = await videoDetailsResponse.json();

      // Анализируем признаки монетизации
      let adsEnabled = false;
      let membershipEnabled = false;
      let superChatEnabled = false;

      if (videoDetailsData.items) {
        for (const video of videoDetailsData.items) {
          // Проверяем наличие лицензии и других признаков монетизации
          if (video.status?.license === 'youtube' && video.contentDetails?.licensedContent) {
            adsEnabled = true;
          }
        }
      }

      // Проверяем канал на наличие членства
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=status&id=${channelId}&key=${this.apiKey}`
      );

      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items?.[0]?.status?.madeForKids === false) {
          membershipEnabled = true;
          superChatEnabled = true;
        }
      }

      const isMonetized = adsEnabled || membershipEnabled || superChatEnabled;

      return {
        isMonetized,
        adsEnabled,
        membershipEnabled,
        superChatEnabled,
      };
    } catch (error) {
      console.error('Error analyzing monetization:', error);
      // Возвращаем базовый анализ при ошибке
      return {
        isMonetized: false,
        adsEnabled: false,
        membershipEnabled: false,
        superChatEnabled: false,
      };
    }
  }

  // Основной метод для полного анализа канала
  async analyzeChannel(url: string): Promise<ChannelAnalysis> {
    const extracted = this.extractChannelId(url);
    
    if (!extracted) {
      throw new Error('Неверный формат ссылки на YouTube канал');
    }

    let channelData: YouTubeChannelData;

    try {
      if (extracted.type === 'channel') {
        channelData = await this.getChannelData(extracted.id);
      } else {
        channelData = await this.getChannelByUsername(extracted.id, extracted.type);
      }

      const monetizationData = await this.analyzeMonetization(channelData.id);

      return {
        channel: channelData,
        monetization: monetizationData,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error analyzing channel:', error);
      throw error;
    }
  }

  // Проверка валидности API ключа
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Форматирование чисел
  private formatNumber(num: string): string {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  }
}

export const youtubeAPI = new YouTubeAPIService();