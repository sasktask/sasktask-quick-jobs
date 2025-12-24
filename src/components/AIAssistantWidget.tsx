import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Wrench,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  followUpQuestions?: string[];
}

interface AIAssistantWidgetProps {
  userRole?: string | null;
  userName?: string;
}

interface UserContext {
  name: string;
  hasPostedTasks: boolean;
  hasCompletedTasks: boolean;
  taskCount: number;
  isTasker: boolean;
  recentActivity: string[];
  city?: string;
  profileCompletion?: number;
  rating?: number;
  totalReviews?: number;
  skills?: string[];
  bio?: string;
  avatarUrl?: string;
  verificationStatus?: string;
  completedTasksCount?: number;
}

// Extract follow-up questions from AI response
const extractFollowUpQuestions = (content: string): { cleanContent: string; questions: string[] } => {
  // Look for the pattern "**You might also want to know:**" or similar
  const patterns = [
    /\*\*You might also want to know:\*\*\s*(.+?)$/i,
    /\*\*Related questions:\*\*\s*(.+?)$/i,
    /\*\*You might also ask:\*\*\s*(.+?)$/i,
    /🔗\s*\*\*Related\*\*:?\s*(.+?)$/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const questionsPart = match[1];
      const cleanContent = content.replace(match[0], '').trim();
      const questions = questionsPart
        .split(/\s*\|\s*/)
        .map(q => q.replace(/^\[|\]$/g, '').trim())
        .filter(q => q.length > 0);
      return { cleanContent, questions };
    }
  }

  return { cleanContent: content, questions: [] };
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getPersonalizedRecommendations = (context: UserContext | null) => {
  if (!context) {
    return [
      { icon: Lightbulb, label: "Get started", prompt: "I'm new to SaskTask. What should I do first to get started?", color: "text-yellow-500" },
      { icon: HelpCircle, label: "How it works", prompt: "Explain how SaskTask works step by step - from posting a task to completion and payment.", color: "text-blue-500" },
    ];
  }

  const recommendations = [];

  // Profile completion suggestions
  if ((context.profileCompletion || 0) < 80) {
    recommendations.push(
      { icon: TrendingUp, label: "Complete your profile", prompt: `My profile is ${context.profileCompletion || 0}% complete. What specific things should I add to improve my profile and get more success on SaskTask?`, color: "text-orange-500" }
    );
  }

  // No avatar
  if (!context.avatarUrl) {
    recommendations.push(
      { icon: Star, label: "Add profile photo", prompt: "Why is a profile photo important on SaskTask? What makes a good profile photo?", color: "text-purple-500" }
    );
  }

  // Verification suggestions
  if (context.verificationStatus !== 'verified') {
    recommendations.push(
      { icon: Shield, label: "Get verified", prompt: "How do I get verified on SaskTask? What are the benefits of verification and what documents do I need?", color: "text-green-500" }
    );
  }

  // For taskers without reviews
  if (context.isTasker && (context.totalReviews || 0) === 0) {
    recommendations.push(
      { icon: Star, label: "Get first review", prompt: "I'm a tasker with no reviews yet. What strategies can I use to get my first reviews and build my reputation?", color: "text-yellow-500" }
    );
  }

  // For taskers with low ratings
  if (context.isTasker && context.rating && context.rating > 0 && context.rating < 4.5) {
    recommendations.push(
      { icon: TrendingUp, label: "Improve rating", prompt: `My current rating is ${context.rating?.toFixed(1)}. What can I do to improve my rating and get more 5-star reviews?`, color: "text-orange-500" }
    );
  }

  // No skills for taskers
  if (context.isTasker && (!context.skills || context.skills.length === 0)) {
    recommendations.push(
      { icon: Wrench, label: "Add your skills", prompt: "What skills should I add to my SaskTask profile to get more task opportunities? Give me examples for different categories.", color: "text-blue-500" }
    );
  }

  // No bio
  if (!context.bio) {
    recommendations.push(
      { icon: FileText, label: "Write your bio", prompt: "Help me write a compelling bio for my SaskTask profile. What should I include to attract more clients?", color: "text-indigo-500" }
    );
  }

  // For new task posters
  if (!context.hasPostedTasks && !context.isTasker) {
    recommendations.push(
      { icon: Zap, label: "Post your first task", prompt: "Help me create my first task on SaskTask. What information do I need and how do I write a good task description?", color: "text-yellow-500" }
    );
  }

  // For successful users - advanced tips
  if (context.isTasker && (context.completedTasksCount || 0) > 10) {
    recommendations.push(
      { icon: TrendingUp, label: "Grow your business", prompt: "I've completed over 10 tasks. What advanced strategies can I use to grow my SaskTask business and earn more?", color: "text-green-500" }
    );
  }

  if (context.hasPostedTasks) {
    recommendations.push(
      { icon: Users, label: "Find perfect tasker", prompt: "What should I look for when choosing a tasker for my task? Give me tips on evaluating profiles and reviews.", color: "text-purple-500" }
    );
  }

  // Add seasonal/contextual recommendations
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 10 || currentMonth <= 2) {
    recommendations.push(
      { icon: Wrench, label: "Winter tasks", prompt: "What winter-related tasks are popular on SaskTask? Snow removal, holiday help, etc.", color: "text-blue-400" }
    );
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    recommendations.push(
      { icon: Wrench, label: "Spring cleaning", prompt: "What spring cleaning and yard work tasks can I post or find on SaskTask?", color: "text-green-400" }
    );
  }

  // Limit to top 4 most relevant
  return recommendations.slice(0, 4);
};

// Organized quick prompts by category
const quickPromptCategories = [
  {
    title: "Getting Started",
    prompts: [
      { icon: HelpCircle, label: "How SaskTask works", prompt: "Explain how SaskTask works step by step - from posting a task to completion and payment. Include the payment flow and escrow system.", color: "text-blue-500" },
      { icon: Lightbulb, label: "First steps guide", prompt: "I'm brand new to SaskTask. Give me a complete beginner's guide - what should I set up first and how do I get started successfully?", color: "text-yellow-500" },
      { icon: Users, label: "Tasker vs Poster", prompt: "What's the difference between being a Task Poster and a Tasker? Can I do both? Explain the benefits of each.", color: "text-purple-500" },
    ]
  },
  {
    title: "Posting Tasks",
    prompts: [
      { icon: FileText, label: "Write task description", prompt: "Help me write a detailed and compelling task description that will attract quality taskers. Ask me what I need done.", color: "text-indigo-500" },
      { icon: DollarSign, label: "Complete pricing guide", prompt: "Give me a comprehensive pricing guide for all types of tasks in Saskatchewan - home services, moving, yard work, handyman, and more. Include budget, standard, and premium rates.", color: "text-green-500" },
      { icon: Users, label: "Choose best tasker", prompt: "What should I look for when choosing a tasker? Give me a detailed checklist for evaluating profiles, reviews, verification status, and bids.", color: "text-teal-500" },
      { icon: Calendar, label: "Scheduling tips", prompt: "What's the best time to post tasks? How do I schedule recurring tasks and set up availability for taskers?", color: "text-cyan-500" },
    ]
  },
  {
    title: "For Taskers",
    prompts: [
      { icon: TrendingUp, label: "Get more tasks", prompt: "I'm a tasker - how do I get more tasks and stand out from the competition? Give me proven strategies to increase my bookings.", color: "text-orange-500" },
      { icon: Star, label: "Get 5-star reviews", prompt: "How do I consistently get 5-star reviews? What do top-rated taskers do differently? Give me actionable tips.", color: "text-yellow-500" },
      { icon: Zap, label: "Write winning bids", prompt: "How do I write bid messages that get accepted? Give me templates and examples for different task types.", color: "text-pink-500" },
      { icon: DollarSign, label: "Set competitive rates", prompt: "How should I price my services as a new tasker vs an experienced one? When should I raise my rates?", color: "text-emerald-500" },
    ]
  },
  {
    title: "Safety & Trust",
    prompts: [
      { icon: Shield, label: "Safety guidelines", prompt: "What are all the safety guidelines I should follow on SaskTask? Both for meeting strangers and protecting my information.", color: "text-red-500" },
      { icon: Shield, label: "Verification benefits", prompt: "Explain all the verification levels on SaskTask. What are the benefits of each and how do I get fully verified?", color: "text-green-500" },
      { icon: HelpCircle, label: "Dispute resolution", prompt: "How does dispute resolution work on SaskTask? What happens if there's a problem with a task or payment?", color: "text-amber-500" },
    ]
  },
  {
    title: "Payments & Fees",
    prompts: [
      { icon: DollarSign, label: "Payment system", prompt: "Explain the complete payment system - deposits, escrow, platform fees, payouts, and when taskers get paid.", color: "text-green-500" },
      { icon: Clock, label: "Cancellation policy", prompt: "What's the cancellation and refund policy? What happens if I need to cancel a task at different timeframes?", color: "text-orange-500" },
      { icon: FileText, label: "Taxes & earnings", prompt: "How do taxes work for SaskTask earnings? Do I get a T4A? How do I track my earnings for tax purposes?", color: "text-blue-500" },
    ]
  },
  {
    title: "Task Categories",
    prompts: [
      { icon: Wrench, label: "All task types", prompt: "What types of tasks can I post or find on SaskTask? Give me examples for every category with typical pricing.", color: "text-orange-500" },
      { icon: MapPin, label: "Seasonal tasks", prompt: "What tasks are in high demand each season in Saskatchewan? Snow removal, lawn care, spring cleaning, etc.", color: "text-sky-500" },
      { icon: Wrench, label: "Tiffin service", prompt: "Tell me about the Tiffin meal delivery service on SaskTask. How does it work, what cuisines are available, and how do I order?", color: "text-rose-500" },
    ]
  },
  {
    title: "Profile & Account",
    prompts: [
      { icon: TrendingUp, label: "Optimize profile", prompt: "How do I create a profile that stands out? Give me a checklist of everything I should complete and tips for each section.", color: "text-violet-500" },
      { icon: Star, label: "Build reputation", prompt: "How do I build a strong reputation on SaskTask? What badges can I earn and how do they help?", color: "text-amber-500" },
      { icon: HelpCircle, label: "Account settings", prompt: "Walk me through all the account settings - notifications, privacy, payment methods, security, and preferences.", color: "text-slate-500" },
    ]
  },
];

// Flat list of most popular prompts for compact view
const quickPrompts = [
  { icon: HelpCircle, label: "How it works", prompt: "Explain how SaskTask works step by step - from posting a task to completion and payment.", color: "text-blue-500" },
  { icon: DollarSign, label: "Pricing guide", prompt: "Give me a comprehensive pricing guide for all types of tasks in Saskatchewan.", color: "text-green-500" },
  { icon: Lightbulb, label: "Write task description", prompt: "Help me write a detailed task description that will attract quality taskers. Ask me what I need done.", color: "text-yellow-500" },
  { icon: TrendingUp, label: "Get more tasks", prompt: "I'm a tasker - how do I get more tasks and stand out from the competition?", color: "text-orange-500" },
  { icon: Shield, label: "Safety tips", prompt: "What safety guidelines should I follow on SaskTask?", color: "text-red-500" },
  { icon: Star, label: "Get 5-star reviews", prompt: "How do I consistently get 5-star reviews as a tasker?", color: "text-yellow-500" },
  { icon: Users, label: "Choose best tasker", prompt: "What should I look for when choosing a tasker?", color: "text-purple-500" },
  { icon: Wrench, label: "Task categories", prompt: "What types of tasks can I post or find on SaskTask?", color: "text-orange-500" },
];

const STORAGE_KEY = 'sasktask_ai_chat_history';

export function AIAssistantWidget({ userRole, userName }: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore if less than 24 hours old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        }
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          messages,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving chat history:', e);
      }
    }
  }, [messages]);

  // Smart input suggestions based on context
  const getInputSuggestions = useCallback(() => {
    const lowercaseInput = input.toLowerCase();
    const suggestions = [];
    
    if (lowercaseInput.includes('price') || lowercaseInput.includes('cost') || lowercaseInput.includes('how much')) {
      suggestions.push('What is a fair price for cleaning?', 'How much should I pay for moving help?');
    }
    if (lowercaseInput.includes('find') || lowercaseInput.includes('search')) {
      suggestions.push('How do I find reliable taskers?', 'What should I look for in reviews?');
    }
    if (lowercaseInput.includes('post') || lowercaseInput.includes('create')) {
      suggestions.push('How do I create an effective task?', 'What details should I include?');
    }
    if (lowercaseInput.includes('safe') || lowercaseInput.includes('trust')) {
      suggestions.push('How does SaskTask protect my payment?', 'What safety features are available?');
    }
    
    return suggestions.slice(0, 3);
  }, [input]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch user context for personalized recommendations
  useEffect(() => {
    const fetchUserContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const [profileResult, tasksResult, bookingsResult, verificationsResult] = await Promise.all([
          supabase.from('profiles').select('full_name, city, skills, bio, avatar_url, profile_completion, rating, total_reviews, completed_tasks').eq('id', user.id).maybeSingle(),
          supabase.from('tasks').select('id, status').eq('task_giver_id', user.id),
          supabase.from('bookings').select('id, status').eq('task_doer_id', user.id),
          supabase.from('verifications').select('verification_status, id_verified, background_check_status').eq('user_id', user.id).maybeSingle()
        ]);

        const profile = profileResult.data;
        const tasks = tasksResult.data || [];
        const bookings = bookingsResult.data || [];
        const verification = verificationsResult.data;

        setUserContext({
          name: profile?.full_name || userName || '',
          hasPostedTasks: tasks.length > 0,
          hasCompletedTasks: tasks.some(t => t.status === 'completed'),
          taskCount: tasks.length,
          isTasker: bookings.length > 0 || (profile?.skills && profile.skills.length > 0),
          recentActivity: [],
          city: profile?.city || undefined,
          profileCompletion: profile?.profile_completion || 0,
          rating: profile?.rating || 0,
          totalReviews: profile?.total_reviews || 0,
          skills: profile?.skills || [],
          bio: profile?.bio || '',
          avatarUrl: profile?.avatar_url || '',
          verificationStatus: verification?.verification_status || 'pending',
          completedTasksCount: profile?.completed_tasks || 0
        });
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    };

    if (isOpen && isAuthenticated) {
      fetchUserContext();
    }
  }, [isOpen, userName, isAuthenticated]);

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
          context: { 
            userRole, 
            userName: userContext?.name || userName,
            isTasker: userContext?.isTasker,
            hasPostedTasks: userContext?.hasPostedTasks,
            city: userContext?.city,
            profileCompletion: userContext?.profileCompletion,
            rating: userContext?.rating,
            totalReviews: userContext?.totalReviews,
            skills: userContext?.skills,
            bio: userContext?.bio,
            hasAvatar: !!userContext?.avatarUrl,
            verificationStatus: userContext?.verificationStatus,
            completedTasksCount: userContext?.completedTasksCount
          }
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
              const { cleanContent, questions } = extractFollowUpQuestions(assistantContent);
              setMessages(prev => 
                prev.map(m => m.id === assistantId 
                  ? { ...m, content: cleanContent, followUpQuestions: questions } 
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
    localStorage.removeItem(STORAGE_KEY);
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1]?.id));
      sendMessage(lastUserMessage.content);
    }
  };

  // Don't show the widget if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
                  {/* Personalized Welcome */}
                  <div className="text-center py-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mx-auto mb-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Sparkles className="h-8 w-8 text-violet-600" />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold text-lg">
                      {getTimeBasedGreeting()}{userContext?.name ? `, ${userContext.name.split(' ')[0]}` : userName ? `, ${userName}` : ""}! 👋
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto">
                      {userContext?.isTasker 
                        ? "Ready to find more tasks? I can help you succeed!"
                        : userContext?.hasPostedTasks 
                          ? "Need help with your tasks? I'm here for you!"
                          : "I'm your AI assistant. Ask me anything about SaskTask!"}
                    </p>
                    {userContext?.city && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Helping you in {userContext.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Personalized Recommendations */}
                  {userContext && getPersonalizedRecommendations(userContext).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Recommended for you
                      </p>
                      <div className="space-y-1.5">
                        {getPersonalizedRecommendations(userContext).map((rec) => (
                          <button
                            key={rec.label}
                            onClick={() => handleQuickPrompt(rec.prompt)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-600/5 to-indigo-600/5 border border-violet-500/20 hover:border-violet-500/40 transition-all text-left group"
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <rec.icon className={cn("h-4 w-4", rec.color)} />
                            </div>
                            <div>
                              <span className="text-sm font-medium">{rec.label}</span>
                              <span className="text-[10px] text-muted-foreground block">Tap to get started →</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick prompts - scrollable grid */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Ask me anything
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickPrompts.slice(0, 8).map((prompt) => (
                        <button
                          key={prompt.label}
                          onClick={() => handleQuickPrompt(prompt.prompt)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                          )}>
                            <prompt.icon className={cn("h-3 w-3", prompt.color)} />
                          </div>
                          <span className="text-[11px] font-medium leading-tight line-clamp-2">{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Popular Questions */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" />
                        Popular questions
                      </p>
                      <div className="space-y-1">
                        {[
                          "What fees does SaskTask charge?",
                          "How do I get verified?",
                          "Is my payment protected?",
                          "Can I cancel a booking?"
                        ].map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(question)}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted border border-transparent hover:border-primary/20 transition-all flex items-center gap-2"
                          >
                            <span className="text-violet-500">→</span>
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-4">
                  {messages.map((msg, msgIndex) => (
                    <div key={msg.id} className="space-y-2">
                      <div
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
                      
                      {/* Follow-up suggestions - ChatGPT style */}
                      {msg.role === "assistant" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && !isLoading && msgIndex === messages.length - 1 && (
                        <div className="ml-9 space-y-1.5">
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-violet-500" />
                            Suggested follow-ups
                          </p>
                          <div className="flex flex-col gap-1">
                            {msg.followUpQuestions.slice(0, 3).map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(question)}
                                className="text-xs text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border/50 hover:border-primary/30 transition-all flex items-start gap-2 group"
                              >
                                <span className="text-violet-500 mt-0.5">→</span>
                                <span className="leading-relaxed">{question}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
              
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setShowSuggestions(e.target.value.length > 3);
                      }}
                      onFocus={() => setShowSuggestions(input.length > 3)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="w-full bg-muted/50 pr-2"
                    />
                    {/* Smart suggestions dropdown */}
                    {showSuggestions && getInputSuggestions().length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                        {getInputSuggestions().map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInput(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
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
