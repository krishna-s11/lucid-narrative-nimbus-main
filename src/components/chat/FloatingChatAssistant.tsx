import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, MessageCircle, X, TrendingUp, TrendingDown, Newspaper, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  messageType?: string;
  data?: any;
}

const FloatingChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m IRIS, your AI trading assistant. I can help you with crypto prices, market analysis, trading advice, and predictions. What would you like to know?',
      timestamp: new Date(),
      messageType: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.chatWithAI(inputMessage);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.reply,
        timestamp: new Date(),
        messageType: response.type,
        data: response.data
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message to AI assistant');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
        messageType: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTypeIcon = (messageType?: string) => {
    switch (messageType) {
      case 'price_response':
        return <DollarSign className="h-4 w-4" />;
      case 'news_response':
        return <Newspaper className="h-4 w-4" />;
      case 'trading_advice':
        return <TrendingUp className="h-4 w-4" />;
      case 'prediction_response':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageTypeBadge = (messageType?: string) => {
    switch (messageType) {
      case 'price_response':
        return <Badge variant="outline" className="text-xs">Price Data</Badge>;
      case 'news_response':
        return <Badge variant="outline" className="text-xs">Market News</Badge>;
      case 'trading_advice':
        return <Badge variant="outline" className="text-xs">Trading Advice</Badge>;
      case 'prediction_response':
        return <Badge variant="outline" className="text-xs">Prediction</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return null;
    }
  };

  const quickActions = [
    { label: 'BTC Price', action: 'What is the current Bitcoin price?' },
    { label: 'Market News', action: 'What are the latest crypto news?' },
    { label: 'Trading Advice', action: 'Should I buy Bitcoin now?' },
    { label: 'ETH Prediction', action: 'What is your prediction for Ethereum?' }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glow-button z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Open AI Chat Assistant</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-success/5">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                IRIS AI Assistant
                <Badge variant="outline" className="ml-auto">
                  Enhanced NLP
                </Badge>
              </SheetTitle>
            </SheetHeader>

            {/* Chat Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          getMessageTypeIcon(message.messageType)
                        )}
                        <span className="font-medium text-sm">
                          {message.type === 'user' ? 'You' : 'IRIS'}
                        </span>
                        {message.type === 'ai' && getMessageTypeBadge(message.messageType)}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">IRIS is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom Section */}
            <div className="p-4 border-t bg-background/50">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInputMessage(action.action);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    disabled={isLoading}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about crypto prices, market analysis..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="glow-button"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingChatAssistant;