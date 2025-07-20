import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Icon from '@/components/ui/icon'
import { youtubeAPI, type ChannelAnalysis } from '@/lib/youtube-api'
import { YouTubeUrlValidator, InputSanitizer } from '@/lib/validators'

const Index = () => {
  const [channelUrl, setChannelUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<ChannelAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleUrlChange = (value: string) => {
    setChannelUrl(value)
    setValidationError(null)
    setError(null)
    
    if (value.trim()) {
      const validation = YouTubeUrlValidator.validate(value)
      if (!validation.isValid) {
        setValidationError(validation.error || null)
      }
    }
  }

  const handleCheck = async () => {
    if (!channelUrl.trim()) return
    
    // Валидация URL
    const validation = YouTubeUrlValidator.validate(channelUrl)
    if (!validation.isValid) {
      setValidationError(validation.error || null)
      return
    }

    // Проверка API ключа
    if (!youtubeAPI.isConfigured()) {
      setError('YouTube API не настроен. Добавьте VITE_YOUTUBE_API_KEY в переменные окружения.')
      return
    }
    
    setIsChecking(true)
    setError(null)
    setResults(null)
    
    try {
      const sanitizedUrl = InputSanitizer.sanitizeUrl(channelUrl)
      const normalizedUrl = YouTubeUrlValidator.normalizeUrl(sanitizedUrl)
      
      const analysis = await youtubeAPI.analyzeChannel(normalizedUrl)
      setResults(analysis)
    } catch (err) {
      console.error('Error checking channel:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при проверке канала')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Youtube" size={32} className="text-[#FF0000]" />
              <h1 className="text-2xl font-bold text-[#282828]">YouTube Monetization Checker</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#check" className="text-[#282828] hover:text-[#FF0000] transition-colors">Проверка</a>
              <a href="#faq" className="text-[#282828] hover:text-[#FF0000] transition-colors">FAQ</a>
              <a href="#contact" className="text-[#282828] hover:text-[#FF0000] transition-colors">Контакты</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#282828] mb-4">
            Проверка монетизации YouTube каналов
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Быстро и точно определите статус монетизации любого YouTube канала по ссылке
          </p>
        </div>
      </section>

      {/* Check Form */}
      <section id="check" className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-[#282828]">
                Введите ссылку на канал
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="https://www.youtube.com/c/channelname"
                  value={channelUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`flex-1 ${validationError ? 'border-red-500' : ''}`}
                />
                <Button 
                  onClick={handleCheck}
                  disabled={!channelUrl || isChecking || !!validationError}
                  className="bg-[#FF0000] hover:bg-[#CC0000] text-white px-8"
                >
                  {isChecking ? (
                    <Icon name="Loader2" className="animate-spin" size={20} />
                  ) : (
                    'Проверить'
                  )}
                </Button>
              </div>
              {validationError && (
                <Alert className="border-red-200 bg-red-50">
                  <Icon name="AlertCircle" size={16} className="text-red-500" />
                  <AlertDescription className="text-red-700">
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <Icon name="AlertCircle" size={16} className="text-red-500" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-gray-500 text-center">
                Поддерживаются ссылки вида: youtube.com/c/name, youtube.com/@name, youtube.com/channel/ID
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      {results && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-[#282828] mb-8 text-center">
                Результаты анализа
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Channel Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon name="User" size={24} />
                      <span>Информация о канале</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {results.channel.thumbnail && (
                        <img 
                          src={results.channel.thumbnail} 
                          alt={results.channel.title}
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[#282828]">{results.channel.title}</p>
                        {results.channel.customUrl && (
                          <p className="text-sm text-gray-600">@{results.channel.customUrl}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Подписчики</p>
                        <p className="font-semibold">{results.channel.subscriberCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Просмотры</p>
                        <p className="font-semibold">{results.channel.viewCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Видео</p>
                        <p className="font-semibold">{results.channel.videoCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Проверено</p>
                        <p className="font-semibold text-xs">
                          {new Date(results.lastChecked).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monetization Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon name="DollarSign" size={24} />
                      <span>Статус монетизации</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={results.monetization.isMonetized ? "default" : "destructive"}
                        className={results.monetization.isMonetized ? "bg-green-500" : ""}
                      >
                        {results.monetization.isMonetized ? 'Монетизирован' : 'Не монетизирован'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Реклама</span>
                        <Icon 
                          name={results.monetization.adsEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.monetization.adsEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Спонсорство</span>
                        <Icon 
                          name={results.monetization.membershipEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.monetization.membershipEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Супер чат</span>
                        <Icon 
                          name={results.monetization.superChatEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.monetization.superChatEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
                      {results.monetization.estimatedRevenue && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Оценочный доход</span>
                          <span className="text-sm font-semibold">{results.monetization.estimatedRevenue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-[#282828] mb-8 text-center">
              Часто задаваемые вопросы
            </h3>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Как работает проверка монетизации?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Сервис анализирует публичные данные канала YouTube через официальный API и определяет наличие 
                  признаков монетизации: рекламы, спонсорских функций и других показателей.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Нужен ли API ключ для работы?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Да, для работы сервиса требуется YouTube Data API ключ. Получить его можно бесплатно 
                  в Google Cloud Console. Ключ нужно указать в переменной окружения VITE_YOUTUBE_API_KEY.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Какие каналы можно проверить?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Можно проверить любые публичные YouTube каналы. Приватные или удаленные 
                  каналы проверить невозможно.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Насколько точны результаты?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Точность составляет около 90-95%. Результаты основаны на анализе публичных 
                  данных и могут не отражать все аспекты монетизации канала.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-[#282828] mb-4">
              Контактная информация
            </h3>
            <p className="text-gray-600 mb-8">
              Есть вопросы или предложения? Свяжитесь с нами!
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="Mail" size={32} className="mx-auto mb-4 text-[#FF0000]" />
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-gray-600">support@example.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="MessageSquare" size={32} className="mx-auto mb-4 text-[#FF0000]" />
                  <h4 className="font-semibold mb-2">Telegram</h4>
                  <p className="text-gray-600">@support_bot</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#282828] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 YouTube Monetization Checker. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

export default Index