import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2, AlertCircle, RefreshCw, User, Trash2, X, Search, Reply } from "lucide-react";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUpload } from "./MediaUpload";
import { MediaMessage } from "./MediaMessage";
import { VoiceRecorder } from "./VoiceRecorder";
import { MessageActions } from "./MessageActions";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { SearchBar, SearchFilters } from "./SearchBar";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { ReplyPreview } from "./ReplyPreview";
import { QuotedMessage } from "./QuotedMessage";

interface ChatInterfaceProps {
  bookingId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserRole: "Task Giver" | "Task Doer";
}

export const ChatInterface = ({
  bookingId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserRole,
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState<{ id: string; content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; message: string; senderName: string; isOwn: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const hasScrolledToUnread = useRef(false);

  const {
    messages,
    isTyping,
    isLoading,
    isSending,
    sendMessage,
    retryMessage,
    handleTyping,
    markMessagesAsRead,
  } = useRealtimeChat({
    bookingId,
    currentUserId,
    otherUserId,
  });

  // Find first unread message
  const firstUnreadIndex = messages.findIndex(
    (msg) => !msg.read_at && msg.receiver_id === currentUserId
  );
  const hasUnreadMessages = firstUnreadIndex !== -1;
  const unreadCount = messages.filter(
    (msg) => !msg.read_at && msg.receiver_id === currentUserId
  ).length;

  // Auto-scroll to first unread or bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasScrolledToUnread.current) {
      // If there are unread messages, scroll to first unread
      if (firstUnreadRef.current && hasUnreadMessages) {
        firstUnreadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (scrollRef.current) {
        // Otherwise scroll to bottom
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      
      // Mark messages as read after scrolling
      setTimeout(() => {
        markMessagesAsRead();
      }, 500);
      
      hasScrolledToUnread.current = true;
    }
  }, [isLoading, messages.length, hasUnreadMessages]);

  // Auto-scroll to bottom on new messages (after initial load)
  useEffect(() => {
    if (hasScrolledToUnread.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Upload attachment helper
  const uploadAttachment = async (file: Blob, fileName: string, type: 'image' | 'file' | 'voice', messageId: string, duration?: number) => {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `${currentUserId}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await (supabase as any)
        .from('message_attachments')
        .insert({
          message_id: messageId,
          file_name: fileName,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          attachment_type: type,
          duration: duration
        });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  };

  // Handle media upload
  const handleMediaUpload = async (file: File, type: 'image' | 'file') => {
    try {
      setUploadingMedia(true);

      // Create message first
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          booking_id: bookingId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: type === 'image' ? '📷 Image' : `📎 ${file.name}`,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Upload attachment
      await uploadAttachment(file, file.name, type, messageData.id);

      toast.success(`${type === 'image' ? 'Image' : 'File'} sent successfully`);
    } catch (error) {
      console.error("Error sending media:", error);
      toast.error(`Failed to send ${type}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Handle voice recording
  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    try {
      setUploadingMedia(true);

      // Create message first
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          booking_id: bookingId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: '🎤 Voice message',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Upload voice note
      await uploadAttachment(audioBlob, 'voice-note.webm', 'voice', messageData.id, duration);

      setIsRecordingVoice(false);
      toast.success("Voice message sent");
    } catch (error) {
      console.error("Error sending voice:", error);
      toast.error("Failed to send voice message");
    } finally {
      setUploadingMedia(false);
    }
  };

  // Load attachments and replied-to messages
  const [messageAttachments, setMessageAttachments] = useState<Record<string, any[]>>({});
  const [repliedMessages, setRepliedMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadMessageData = async () => {
      const attachmentsMap: Record<string, any[]> = {};
      const repliesMap: Record<string, any> = {};
      
      for (const message of messages) {
        // Load attachments
        const { data: attachments } = await (supabase as any)
          .from('message_attachments')
          .select('*')
          .eq('message_id', message.id);

        if (attachments && attachments.length > 0) {
          attachmentsMap[message.id] = attachments;
        }

        // Load replied-to message if exists
        if (message.reply_to_id) {
          const { data: repliedMsg } = await supabase
            .from('messages')
            .select('*, profiles!messages_sender_id_fkey(full_name)')
            .eq('id', message.reply_to_id)
            .single();

          if (repliedMsg) {
            repliesMap[message.id] = repliedMsg;
          }
        }
      }

      setMessageAttachments(attachmentsMap);
      setRepliedMessages(repliesMap);
    };

    if (messages.length > 0) {
      loadMessageData();
    }
  }, [messages]);

  // Message deletion handlers
  const handleDeleteSingle = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBulk = () => {
    if (selectedMessages.size === 0) {
      toast.error("No messages selected");
      return;
    }
    setMessageToDelete(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const messagesToDelete = messageToDelete
        ? [messageToDelete]
        : Array.from(selectedMessages);

      // Delete attachments from storage first
      for (const messageId of messagesToDelete) {
        const attachments = messageAttachments[messageId];
        if (attachments) {
          for (const attachment of attachments) {
            await supabase.storage
              .from('message-attachments')
              .remove([attachment.storage_path]);
          }
        }
      }

      // Delete messages (cascades to message_attachments)
      const { error } = await supabase
        .from("messages")
        .delete()
        .in("id", messagesToDelete);

      if (error) throw error;

      toast.success(
        messagesToDelete.length === 1
          ? "Message deleted"
          : `${messagesToDelete.length} messages deleted`
      );

      // Reset selection
      setSelectedMessages(new Set());
      setSelectionMode(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast.error("Failed to delete messages");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAll = () => {
    const ownMessages = messages
      .filter((msg) => msg.sender_id === currentUserId)
      .map((msg) => msg.id);
    setSelectedMessages(new Set(ownMessages));
  };

  const cancelSelection = () => {
    setSelectedMessages(new Set());
    setSelectionMode(false);
  };

  // Search functionality
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleClearSearch = () => {
    setSearchFilters(null);
    setSearchMode(false);
  };

  // Forward message handler
  const handleForwardMessage = (messageId: string, messageContent: string) => {
    setMessageToForward({ id: messageId, content: messageContent });
    setForwardDialogOpen(true);
  };

  const handleForwardComplete = () => {
    setMessageToForward(null);
    toast.success("Message forwarded");
  };

  // Reply message handler
  const handleReply = (messageId: string, messageContent: string, senderName: string, isOwn: boolean) => {
    setReplyingTo({ id: messageId, message: messageContent, senderName, isOwn });
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Filter messages based on search criteria
  const filteredMessages = searchFilters
    ? messages.filter((message) => {
        // Filter by content
        if (searchFilters.query && !message.message.toLowerCase().includes(searchFilters.query.toLowerCase())) {
          return false;
        }

        // Filter by sender
        if (searchFilters.sender === "me" && message.sender_id !== currentUserId) {
          return false;
        }
        if (searchFilters.sender === "them" && message.sender_id === currentUserId) {
          return false;
        }

        // Filter by date range
        const messageDate = new Date(message.created_at);
        if (searchFilters.dateFrom && messageDate < searchFilters.dateFrom) {
          return false;
        }
        if (searchFilters.dateTo) {
          const endOfDay = new Date(searchFilters.dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          if (messageDate > endOfDay) {
            return false;
          }
        }

        return true;
      })
    : messages;

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const message = inputValue;
    const replyToId = replyingTo?.id;
    
    setInputValue("");
    setReplyingTo(null);
    
    try {
      // If replying, create message with reply_to_id
      if (replyToId) {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            booking_id: bookingId,
            sender_id: currentUserId,
            receiver_id: otherUserId,
            message: message,
            reply_to_id: replyToId,
          })
          .select()
          .single();

        if (error) throw error;
      } else {
        await sendMessage(message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background">
      {/* Chat Header */}
      <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
        {searchMode ? (
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            currentUserId={currentUserId}
            otherUserName={otherUserName}
          />
        ) : (
          <div className="flex items-center gap-3">
            {selectionMode ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelSelection}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div className="flex-1 text-sm font-medium">
              {selectedMessages.size} selected
            </div>
            {selectedMessages.size > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteBulk}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{otherUserName}</h3>
              <p className="text-xs text-muted-foreground">{otherUserRole}</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} unread
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchMode(true)}
              title="Search messages"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectionMode(true)}
            >
              Select
            </Button>
          </>
        )}
          </div>
        )}
        {searchFilters && (
          <div className="text-xs text-muted-foreground">
            {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""} found
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchFilters ? "No messages match your search" : "No messages yet. Start the conversation!"}
              </p>
            </div>
          ) : (
            filteredMessages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const isFailed = message.status === "failed";
              const isUnread = !message.read_at && message.receiver_id === currentUserId;
              const isFirstUnread = index === firstUnreadIndex && hasUnreadMessages;

              return (
                <div key={message.id}>
                  {/* Unread Messages Divider */}
                  {isFirstUnread && (
                    <div
                      ref={firstUnreadRef}
                      className="flex items-center gap-2 my-4"
                    >
                      <div className="flex-1 h-px bg-primary"></div>
                      <span className="text-xs font-medium text-primary px-2">
                        Unread Messages
                      </span>
                      <div className="flex-1 h-px bg-primary"></div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "flex gap-2 group",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {selectionMode && isOwn && (
                      <Checkbox
                        checked={selectedMessages.has(message.id)}
                        onCheckedChange={() => toggleMessageSelection(message.id)}
                        className="mt-2"
                      />
                    )}
                    
                    {!isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={otherUserAvatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 max-w-[70%]">
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 relative",
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                          isFailed && "opacity-50",
                          isUnread && !isOwn && "ring-2 ring-primary/50"
                        )}
                      >
                        {isUnread && !isOwn && (
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                        )}
                        {/* Show quoted message if this is a reply */}
                        {message.reply_to_id && repliedMessages[message.id] && (
                          <QuotedMessage
                            senderName={
                              repliedMessages[message.id].sender_id === currentUserId
                                ? "You"
                                : repliedMessages[message.id].profiles?.full_name || otherUserName
                            }
                            message={repliedMessages[message.id].message}
                            isOwn={repliedMessages[message.id].sender_id === currentUserId}
                            isOwnReply={isOwn}
                          />
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                        {messageAttachments[message.id] && (
                          <MediaMessage attachments={messageAttachments[message.id]} />
                        )}
                        <div className={cn(
                          "flex items-center gap-2 mt-1",
                          isOwn ? "justify-end" : "justify-start"
                        )}>
                          <span className={cn(
                            "text-xs",
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(message.created_at), "HH:mm")}
                          </span>
                          {isFailed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                              onClick={() => retryMessage(message.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {!selectionMode && isOwn && (
                        <MessageActions
                          onDelete={() => handleDeleteSingle(message.id)}
                          onForward={() => handleForwardMessage(message.id, message.message)}
                          onReply={() => handleReply(message.id, message.message, "You", true)}
                          isOwn={isOwn}
                        />
                      )}
                      {!selectionMode && !isOwn && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(message.id, message.message, otherUserName, false)}
                            className="h-auto p-1 hover:text-primary"
                            title="Reply"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        {isRecordingVoice ? (
          <VoiceRecorder
            onSend={handleVoiceSend}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <div className="space-y-2">
            {replyingTo && (
              <ReplyPreview
                senderName={replyingTo.isOwn ? "You" : replyingTo.senderName}
                message={replyingTo.message}
                onCancel={cancelReply}
                isOwn={replyingTo.isOwn}
              />
            )}
            <div className="flex gap-2">
            <MediaUpload
              onFileSelect={handleMediaUpload}
              onVoiceRecord={() => setIsRecordingVoice(true)}
            />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder={replyingTo ? `Replying to ${replyingTo.senderName}...` : "Type a message..."}
              disabled={isSending || uploadingMedia}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending || uploadingMedia}
              size="icon"
            >
              {isSending || uploadingMedia ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteMessageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        messageCount={messageToDelete ? 1 : selectedMessages.size}
      />

      {/* Forward Message Dialog */}
      {messageToForward && (
        <ForwardMessageDialog
          open={forwardDialogOpen}
          onOpenChange={setForwardDialogOpen}
          messageId={messageToForward.id}
          messageContent={messageToForward.content}
          currentBookingId={bookingId}
          onForwardComplete={handleForwardComplete}
        />
      )}
    </div>
  );
};
