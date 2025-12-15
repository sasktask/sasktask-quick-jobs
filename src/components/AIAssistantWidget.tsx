import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Lightbulb,
  DollarSign,
  HelpCircle,
  Loader2,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  FileText,
  Users,
  Shield,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantWidgetProps {
  userRole?: string | null;
  userName?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const quickPrompts = [
  { icon: Lightbulb, label: "Write a task description", prompt: "Help me write a detailed and clear task description that will attract quality taskers. Ask me what I need done.", color: "text-yellow-500" },
  { icon: DollarSign, label: "Pricing guide", prompt: "What are fair price ranges for different types of tasks in Saskatchewan? Give me a comprehensive pricing guide.", color: "text-green-500" },
  { icon: HelpCircle, label: "How SaskTask works", prompt: "Explain how SaskTask works step by step - from posting a task to completion and payment.", color: "text-blue-500" },
  { icon: Users, label: "Finding taskers", prompt: "What should I look for when choosing a tasker? Give me tips on evaluating profiles and reviews.", color: "text-purple-500" },
  { icon: Shield, label: "Safety tips", prompt: "What safety guidelines should I follow as a user of SaskTask? Both as a task giver and task doer.", color: "text-red-500" },
  { icon: Wrench, label: "Task categories", prompt: "What types of tasks can I post or find on SaskTask? Give me examples for each category.", color: "text-orange-500" },
];

export function AIAssistantWidget({ userRole, userName }: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { 
      id: generateId(), 
      role: "user", 
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = generateId();

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: { userRole, userName }
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { 
        id: assistantId, 
        role: "assistant", 
        content: "",
        timestamp: new Date()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => m.id === assistantId 
                  ? { ...m, content: assistantContent } 
                  : m
                )
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [
        ...prev.filter(m => m.id !== assistantId),
        { 
          id: assistantId, 
          role: "assistant", 
          content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1]?.id));
      sendMessage(lastUserMessage.content);
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl flex items-center justify-center group"
      >
        <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
        <span className="absolute inset-0 rounded-full bg-violet-400/30 animate-ping" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "fixed z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col",
        isMinimized 
          ? "bottom-20 left-4 lg:bottom-6 lg:left-6 w-80 h-14"
          : "bottom-20 left-4 lg:bottom-6 lg:left-6 w-[380px] h-[550px] max-h-[85vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-b border-border rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">SaskTask AI</p>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-gradient-to-r from-violet-600/20 to-indigo-600/20">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                Pro
              </Badge>
            </div>
            {!isMinimized && (
              <p className="text-xs text-muted-foreground">Ask me anything about tasks</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !isMinimized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Messages - using regular div with overflow for better scroll control */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Sparkles className="h-8 w-8 text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Hi{userName ? `, ${userName}` : ""}! 👋</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
                      I'm your AI assistant. I can help with task descriptions, pricing, platform questions, and more!
                    </p>
                  </div>
                  
                  {/* Quick prompts - scrollable grid */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Quick actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt.label}
                          onClick={() => handleQuickPrompt(prompt.prompt)}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                        >
                          <div className={cn(
                            "h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                          )}>
                            <prompt.icon className={cn("h-3.5 w-3.5", prompt.color)} />
                          </div>
                          <span className="text-xs font-medium leading-tight">{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm relative group",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                code: ({ children }) => (
                                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs">{children}</code>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        
                        {/* Copy button for assistant messages */}
                        {msg.role === "assistant" && msg.content && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border shadow-sm"
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex-shrink-0">
              {/* Retry button */}
              {messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && !isLoading && (
                <div className="flex justify-center mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground gap-1"
                    onClick={retryLastMessage}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Regenerate response
                  </Button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/50"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
