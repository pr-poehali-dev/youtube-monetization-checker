import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Icon from '@/components/ui/icon'

const Index = () => {
  const [channelUrl, setChannelUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState(null)

  const handleCheck = async () => {
    if (!channelUrl) return
    
    setIsChecking(true)
    // Имитация проверки
    setTimeout(() => {
      setResults({
        channelName: 'Пример канала',
        isMonetized: true,
        subscribers: '125,000',
        views: '2,500,000',
        videoCount: 450,
        adsEnabled: true,
        membershipEnabled: true,
        superChatEnabled: true
      })
      setIsChecking(false)
    }, 2000)
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
                  onChange={(e) => setChannelUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCheck}
                  disabled={!channelUrl || isChecking}
                  className="bg-[#FF0000] hover:bg-[#CC0000] text-white px-8"
                >
                  {isChecking ? (
                    <Icon name="Loader2" className="animate-spin" size={20} />
                  ) : (
                    'Проверить'
                  )}
                </Button>
              </div>
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
                    <div>
                      <p className="font-semibold text-[#282828]">{results.channelName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Подписчики</p>
                        <p className="font-semibold">{results.subscribers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Просмотры</p>
                        <p className="font-semibold">{results.views}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Видео</p>
                        <p className="font-semibold">{results.videoCount}</p>
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
                        variant={results.isMonetized ? "default" : "destructive"}
                        className={results.isMonetized ? "bg-green-500" : ""}
                      >
                        {results.isMonetized ? 'Монетизирован' : 'Не монетизирован'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Реклама</span>
                        <Icon 
                          name={results.adsEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.adsEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Спонсорство</span>
                        <Icon 
                          name={results.membershipEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.membershipEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Супер чат</span>
                        <Icon 
                          name={results.superChatEnabled ? "Check" : "X"} 
                          size={16} 
                          className={results.superChatEnabled ? "text-green-500" : "text-red-500"}
                        />
                      </div>
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
                  Сервис анализирует публичные данные канала YouTube и определяет наличие 
                  признаков монетизации: рекламы, спонсорских функций и других показателей.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Какие каналы можно проверить?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Можно проверить любые публичные YouTube каналы. Приватные или удаленные 
                  каналы проверить невозможно.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Насколько точны результаты?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Точность составляет около 95%. Результаты основаны на анализе публичных 
                  данных и могут не отражать все аспекты монетизации канала.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Бесплатно ли пользоваться сервисом?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Да, базовая проверка монетизации полностью бесплатна. 
                  Ограничений на количество проверок нет.
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