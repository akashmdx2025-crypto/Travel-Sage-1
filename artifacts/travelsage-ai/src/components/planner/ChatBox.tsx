import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useChatWithTravelSage } from '@workspace/api-client-react';
import { ChatResult } from '@workspace/api-zod/src/generated/types/chatResult';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  result?: ChatResult;
}

interface ChatBoxProps {
  documentId: string;
}

export function ChatBox({ documentId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I have analyzed your travel guide. What would you like to know about this destination?' }
  ]);
  const [input, setInput] = useState('');
  const chatMutation = useChatWithTravelSage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    chatMutation.mutate(
      {
        data: {
          documentId,
          question: userMessage,
        },
      },
      {
        onSuccess: (data) => {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: data.answer, result: data }
          ]);
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: "I'm sorry, I encountered an error while consulting the guide." }
          ]);
        }
      }
    );
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-sm border-muted">
      <CardHeader className="py-3 border-b bg-muted/30">
        <CardTitle className="text-sm font-semibold flex items-center text-primary">
          <Bot className="h-4 w-4 mr-2" /> Expert Guide
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted text-foreground rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.result?.guardrail && (
                    <div className={`mt-2 pt-2 border-t text-[10px] flex items-start gap-1 ${
                      msg.result.guardrail.passed ? 'border-primary/10 text-primary/70' : 'border-destructive/20 text-destructive/80'
                    }`}>
                      {msg.result.guardrail.passed ? (
                        <ShieldCheck className="h-3 w-3 shrink-0" />
                      ) : (
                        <ShieldAlert className="h-3 w-3 shrink-0" />
                      )}
                      <span>
                        {msg.result.guardrail.passed ? 'Source grounded' : `Hallucination warning: ${msg.result.guardrail.reason}`}
                      </span>
                    </div>
                  )}

                  {msg.result?.sources && msg.result.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                      <span className="font-semibold block mb-1">Sources cited:</span>
                      <ul className="space-y-1">
                        {msg.result.sources.map((source, idx) => (
                          <li key={idx} className="line-clamp-1 italic">"{source.text}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg rounded-tl-none p-3 text-sm flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Consulting guide...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 border-t bg-muted/10">
        <form 
          className="flex w-full space-x-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            placeholder="Ask about specific places, transport, or culture..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || chatMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
