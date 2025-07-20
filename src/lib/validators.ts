// Validation utilities for YouTube URLs and other inputs

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class YouTubeUrlValidator {
  private static readonly YOUTUBE_PATTERNS = [
    // youtube.com/channel/UC...
    /^https?:\/\/(www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]{24})(\?.*)?$/,
    // youtube.com/c/channelname
    /^https?:\/\/(www\.)?youtube\.com\/c\/([a-zA-Z0-9_-]+)(\?.*)?$/,
    // youtube.com/user/username
    /^https?:\/\/(www\.)?youtube\.com\/user\/([a-zA-Z0-9_-]+)(\?.*)?$/,
    // youtube.com/@handle
    /^https?:\/\/(www\.)?youtube\.com\/@([a-zA-Z0-9_-]+)(\?.*)?$/,
    // youtu.be/... (video links - we'll extract channel from these)
    /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
  ];

  static validate(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'Введите ссылку на YouTube канал'
      };
    }

    // Очищаем URL от лишних пробелов
    const cleanUrl = url.trim();

    // Проверяем, что это вообще YouTube ссылка
    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      return {
        isValid: false,
        error: 'Это не ссылка на YouTube'
      };
    }

    // Проверяем по паттернам
    const isValidPattern = this.YOUTUBE_PATTERNS.some(pattern => pattern.test(cleanUrl));

    if (!isValidPattern) {
      return {
        isValid: false,
        error: 'Неверный формат ссылки. Поддерживаются: youtube.com/c/name, youtube.com/@name, youtube.com/channel/ID'
      };
    }

    return {
      isValid: true
    };
  }

  static normalizeUrl(url: string): string {
    // Убираем параметры запроса и нормализуем URL
    const cleanUrl = url.trim();
    
    // Добавляем https:// если его нет
    if (!cleanUrl.startsWith('http')) {
      return 'https://' + cleanUrl;
    }

    // Убираем параметры после ?
    const urlObj = new URL(cleanUrl);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  }

  static extractChannelInfo(url: string): { type: string; id: string } | null {
    const patterns = [
      { regex: /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/, type: 'channel' },
      { regex: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'custom' },
      { regex: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'user' },
      { regex: /youtube\.com\/@([a-zA-Z0-9_-]+)/, type: 'handle' },
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return { type: pattern.type, id: match[1] };
      }
    }

    return null;
  }
}

export class ApiKeyValidator {
  static validate(apiKey: string): ValidationResult {
    if (!apiKey) {
      return {
        isValid: false,
        error: 'API ключ не указан'
      };
    }

    // YouTube API ключи обычно имеют формат AIza...
    if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
      return {
        isValid: false,
        error: 'Неверный формат API ключа YouTube'
      };
    }

    return {
      isValid: true
    };
  }
}

export class ChannelDataValidator {
  static validateChannelResponse(response: any): ValidationResult {
    if (!response) {
      return {
        isValid: false,
        error: 'Пустой ответ от API'
      };
    }

    if (!response.items || !Array.isArray(response.items)) {
      return {
        isValid: false,
        error: 'Неверная структура ответа API'
      };
    }

    if (response.items.length === 0) {
      return {
        isValid: false,
        error: 'Канал не найден'
      };
    }

    const item = response.items[0];
    if (!item.snippet || !item.statistics) {
      return {
        isValid: false,
        error: 'Неполные данные канала'
      };
    }

    return {
      isValid: true
    };
  }
}

// Дополнительные утилиты для валидации
export class InputSanitizer {
  static sanitizeUrl(url: string): string {
    return url
      .trim()
      .replace(/[<>'"]/g, '') // Убираем потенциально опасные символы
      .substring(0, 500); // Ограничиваем длину
  }

  static sanitizeApiKey(key: string): string {
    return key
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '') // Только допустимые символы для API ключа
      .substring(0, 100);
  }
}

export default {
  YouTubeUrlValidator,
  ApiKeyValidator,
  ChannelDataValidator,
  InputSanitizer
};