
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ConversationInputProps {
  onSend: (message: string) => void;
  onVoiceInput?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  onSend,
  onVoiceInput,
  disabled,
  loading,
}) => {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };
  return (
    <div className="flex items-end gap-2 w-full bg-white px-2 py-3 rounded-b-lg border-t">
      <Button
        onClick={onVoiceInput}
        size="icon"
        variant="outline"
        disabled={disabled || loading}
        aria-label="Voice input"
        className="shrink-0"
      >
        <Mic />
      </Button>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled || loading}
        placeholder="Send a message"
        className="resize-none min-h-[38px] max-h-24"
      />
      <Button
        onClick={handleSend}
        size="icon"
        variant="default"
        disabled={!text.trim() || disabled || loading}
        aria-label="Send message"
        className="shrink-0"
      >
        <Send />
      </Button>
    </div>
  );
};

export default ConversationInput;
