import { Check, CheckCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface ReadReceiptsProps {
  status: 'sent' | 'delivered' | 'read';
  readAt?: string | null;
  isSender: boolean;
}

export function ReadReceipts({ status, readAt, isSender }: ReadReceiptsProps) {
  if (!isSender) return null;

  const getIcon = () => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-4 w-4 text-primary" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Check className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'read':
        return readAt ? `Read ${format(new Date(readAt), 'MMM d, h:mm a')}` : 'Read';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Sent';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            {getIcon()}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getLabel()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}