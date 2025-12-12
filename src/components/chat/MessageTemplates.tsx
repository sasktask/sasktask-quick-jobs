import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText, Clock, CheckCircle, MapPin, DollarSign, ThumbsUp, HelpCircle } from "lucide-react";

interface MessageTemplatesProps {
  onSelectTemplate: (message: string) => void;
}

const templates = [
  {
    category: "Status Updates",
    icon: Clock,
    items: [
      { label: "On my way", message: "I'm on my way now! Should arrive in about 15 minutes." },
      { label: "Running late", message: "I'm running a bit late. I'll be there in about 30 minutes. Sorry for the inconvenience!" },
      { label: "Arrived", message: "I've arrived at the location. Ready to start whenever you are!" },
      { label: "Taking a break", message: "Taking a short break. Will resume in 15 minutes." },
    ],
  },
  {
    category: "Task Progress",
    icon: CheckCircle,
    items: [
      { label: "Started work", message: "I've started working on the task. Will keep you updated on progress." },
      { label: "Halfway done", message: "Good progress! I'm about halfway done with the task." },
      { label: "Almost finished", message: "Almost finished! Just wrapping up the final details." },
      { label: "Task completed", message: "The task is now complete! Please review and let me know if everything looks good." },
    ],
  },
  {
    category: "Questions",
    icon: HelpCircle,
    items: [
      { label: "Clarification needed", message: "Could you please clarify the details about this task? I want to make sure I understand correctly." },
      { label: "Need materials", message: "Do you have the necessary materials/tools, or should I bring my own?" },
      { label: "Confirm time", message: "Just confirming - is the scheduled time still good for you?" },
      { label: "Access question", message: "How will I access the location? Is there a code or should I call when I arrive?" },
    ],
  },
  {
    category: "Payment",
    icon: DollarSign,
    items: [
      { label: "Request payment", message: "The task is complete. Please proceed with the payment when you're ready." },
      { label: "Payment received", message: "Payment received. Thank you for using SaskTask!" },
      { label: "Quote provided", message: "Based on the task requirements, my estimate is included in my bid. Let me know if you have any questions!" },
    ],
  },
  {
    category: "General",
    icon: ThumbsUp,
    items: [
      { label: "Thank you", message: "Thank you! I appreciate your business." },
      { label: "No problem", message: "No problem at all! Happy to help." },
      { label: "See you soon", message: "Looking forward to working with you!" },
      { label: "Leave a review", message: "If you're happy with my work, I'd really appreciate a review. It helps me get more tasks!" },
    ],
  },
];

export const MessageTemplates = ({ onSelectTemplate }: MessageTemplatesProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (message: string) => {
    onSelectTemplate(message);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Quick replies"
        >
          <MessageSquareText className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm">Quick Replies</h4>
          <p className="text-xs text-muted-foreground">Select a template to insert</p>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-3">
            {templates.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <category.icon className="h-3.5 w-3.5" />
                  {category.category}
                </div>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <button
                      key={item.label}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      onClick={() => handleSelect(item.message)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};