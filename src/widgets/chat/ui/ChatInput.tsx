'use client'
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../../shared/lib/utils';
import { useSpeechRecognition } from '../../../features/speech/lib/useSpeechRecognition';
import { Icon } from '../../../shared/ui/icons';

interface ChatInputProps {
  isLoading: boolean;
  onSend: (text: string) => void;
  onAbort?: () => void;
}

export function ChatInput({ isLoading, onSend, onAbort }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSpeechResult = (transcript: string) => {
    setText(prev => {
      const newText = prev ? `${prev} ${transcript}` : transcript;
      return newText;
    });
    if (textareaRef.current) {
       textareaRef.current.focus();
    }
  };

  const { isRecording, toggleRecording, isSupported, error } = useSpeechRecognition(handleSpeechResult);

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    setTimeout(handleResize, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    handleResize();
  };

  return (
    <div className="border-t border-[#e7e5e4] bg-gradient-to-b from-[#fafaf9]/0 to-[#fafaf9] pt-[14px] pb-[14px] px-4 sm:px-8">
      <div className="max-w-[760px] mx-auto">
        <div className="flex flex-col bg-white border border-[#e7e5e4] rounded-[14px] p-2.5 pb-2 composer-shadow focus-within:border-[#d4d4d8] focus-within:composer-shadow-focus transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Слушаю..." : "Спросите что-нибудь..."}
            className="w-full bg-transparent resize-none outline-none px-1 py-1.5 min-h-[24px] max-h-[220px] text-[15px] text-[#111111] placeholder-[#a1a1aa]"
            rows={1}
          />
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={toggleRecording}
              disabled={!isSupported}
              title={isSupported ? (isRecording ? "Остановить запись" : "Записать голос") : "Голосовой ввод не поддерживается"}
              className={cn(
                "w-[34px] h-[34px] rounded-full border border-[#e7e5e4] bg-white flex items-center justify-center shrink-0 transition-all",
                isRecording 
                  ? "bg-red-50 border-red-200 text-red-600 animate-pulse relative" 
                  : "text-[#3f3f46] hover:bg-[#f5f5f4] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isRecording ? (
                 <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_0_0_rgba(220,38,38,0.5)] animate-ping" />
              ) : (
                <Icon.Mic className="w-[18px] h-[18px]" strokeWidth={1.7} />
              )}
            </button>
            <div className="text-[11px] text-[#a1a1aa] ml-1 flex-1 hidden sm:block truncate">
              Enter — отправить · Shift+Enter — новая строка
            </div>
            {isLoading ? (
              <button
                onClick={onAbort}
                title="Остановить"
                className="h-[34px] px-3.5 rounded-[10px] bg-[#3f3f46] text-white flex items-center gap-1.5 text-[13px] font-medium shrink-0 hover:opacity-90 transition-opacity"
              >
                <Icon.Stop className="w-3.5 h-3.5 fill-current" />
                <span>Остановить</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                title="Отправить"
                className="h-[34px] w-[34px] rounded-[10px] bg-[#111111] text-white flex items-center justify-center shrink-0 disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-90 transition-opacity active:translate-y-[1px]"
              >
                <Icon.ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
        {error && (
            <div className="mt-2 text-[#9f1239] text-[12px] bg-[#fff1f2] border border-[#fecdd3] px-2.5 py-1.5 rounded-lg">
                Ошибка: {error}
            </div>
        )}
      </div>
    </div>
  );
}
