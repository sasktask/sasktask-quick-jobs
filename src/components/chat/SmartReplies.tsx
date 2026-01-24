import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ThumbsUp, 
  Clock, 
  CheckCircle, 
  HelpCircle,
  Calendar,
  MessageSquare,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartRepliesProps {
  lastMessage: string;
  lastMessageSenderId: string;
  currentUserId: string;
  bookingStatus?: string;
  onSelectReply: (reply: string) => void;
  className?: string;
}

interface SuggestedReply {
  text: string;
  icon?: React.ReactNode;
  category: 'quick' | 'contextual' | 'action';
}

export const SmartReplies = ({
  lastMessage,
  lastMessageSenderId,
  currentUserId,
  bookingStatus = 'pending',
  onSelectReply,
  className,
}: SmartRepliesProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Don't show for own messages
  const isOwnMessage = lastMessageSenderId === currentUserId;

  // Generate smart replies based on context
  const suggestedReplies = useMemo((): SuggestedReply[] => {
    if (isOwnMessage || dismissed) return [];

    const messageLower = lastMessage.toLowerCase();
    const replies: SuggestedReply[] = [];

    // Question detection
    if (messageLower.includes('?')) {
      if (messageLower.includes('when') || messageLower.includes('what time') || messageLower.includes('available')) {
        replies.push(
          { text: "I'm available tomorrow afternoon", icon: <Calendar className="h-3 w-3" />, category: 'contextual' },
          { text: "Let me check my schedule", icon: <Clock className="h-3 w-3" />, category: 'contextual' },
          { text: "Any time works for me!", category: 'quick' },
        );
      } else if (messageLower.includes('how much') || messageLower.includes('price') || messageLower.includes('cost')) {
        replies.push(
          { text: "The price is as listed", category: 'contextual' },
          { text: "I can discuss the budget", category: 'contextual' },
          { text: "Let me give you a quote", category: 'action' },
        );
      } else if (messageLower.includes('can you') || messageLower.includes('could you') || messageLower.includes('would you')) {
        replies.push(
          { text: "Yes, I can do that!", icon: <CheckCircle className="h-3 w-3" />, category: 'quick' },
          { text: "Let me see what I can do", category: 'contextual' },
          { text: "I'll need more details first", icon: <HelpCircle className="h-3 w-3" />, category: 'contextual' },
        );
      } else {
        replies.push(
          { text: "Yes", icon: <ThumbsUp className="h-3 w-3" />, category: 'quick' },
          { text: "No, sorry", category: 'quick' },
          { text: "Let me think about it", category: 'contextual' },
        );
      }
    }

    // Greeting detection
    if (messageLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      replies.push(
        { text: "Hi! How can I help you?", category: 'quick' },
        { text: "Hello! Nice to meet you", category: 'quick' },
        { text: "Hey! Ready to get started?", category: 'quick' },
      );
    }

    // Thank you detection
    if (messageLower.includes('thank') || messageLower.includes('thanks')) {
      replies.push(
        { text: "You're welcome!", category: 'quick' },
        { text: "Happy to help!", category: 'quick' },
        { text: "Anytime! 😊", category: 'quick' },
      );
    }

    // Confirmation requests
    if (messageLower.includes('confirm') || messageLower.includes('sure') || messageLower.includes('ok?')) {
      replies.push(
        { text: "Yes, confirmed!", icon: <CheckCircle className="h-3 w-3" />, category: 'action' },
        { text: "Sounds good to me", icon: <ThumbsUp className="h-3 w-3" />, category: 'quick' },
        { text: "Let me double-check first", category: 'contextual' },
      );
    }

    // Task-related
    if (messageLower.includes('task') || messageLower.includes('work') || messageLower.includes('job')) {
      replies.push(
        { text: "I'll start right away", icon: <CheckCircle className="h-3 w-3" />, category: 'action' },
        { text: "Can you provide more details?", icon: <HelpCircle className="h-3 w-3" />, category: 'contextual' },
      );
    }

    // Status-based suggestions
    if (bookingStatus === 'accepted' || bookingStatus === 'in_progress') {
      if (!replies.some(r => r.text.includes('update'))) {
        replies.push(
          { text: "I'll keep you updated on progress", category: 'action' },
        );
      }
    }

    // If no specific matches, provide generic quick replies
    if (replies.length === 0) {
      replies.push(
        { text: "Got it, thanks!", icon: <ThumbsUp className="h-3 w-3" />, category: 'quick' },
        { text: "Sounds good!", category: 'quick' },
        { text: "I'll get back to you soon", icon: <Clock className="h-3 w-3" />, category: 'contextual' },
        { text: "Can you tell me more?", icon: <MessageSquare className="h-3 w-3" />, category: 'contextual' },
      );
    }

    // Limit to 4 suggestions
    return replies.slice(0, 4);
  }, [lastMessage, isOwnMessage, bookingStatus, dismissed]);

  // Reset dismissed state when message changes
  useEffect(() => {
    setDismissed(false);
    setIsVisible(true);
  }, [lastMessage]);

  if (isOwnMessage || dismissed || suggestedReplies.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={cn("overflow-hidden", className)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Quick replies</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-auto"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {suggestedReplies.map((reply, index) => (
              <motion.div
                key={reply.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs gap-1.5 rounded-full transition-all hover:scale-105",
                    "bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/5",
                    reply.category === 'action' && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => {
                    onSelectReply(reply.text);
                    setIsVisible(false);
                  }}
                >
                  {reply.icon}
                  {reply.text}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartReplies;
