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
    <div className="bg-transparent pt-[14px] pb-[14px] px-6 sm:px-12 w-full">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center bg-[#102d6b] border border-[#1d3d82] rounded-[16px] sm:rounded-2xl p-2 transition-all focus-within:border-[#2a52a5]">
          <button
            onClick={toggleRecording}
            disabled={!isSupported}
            title={isSupported ? (isRecording ? "Остановить запись" : "Записать голос") : "Голосовой ввод не поддерживается"}
            className={cn(
              "w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 transition-all",
              isRecording 
                ? "bg-red-500/20 text-red-400 animate-pulse relative" 
                : "text-[#6b8cbe] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {isRecording ? (
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_0_rgba(239,68,68,0.5)] animate-ping" />
            ) : (
              <Icon.Mic className="w-5 h-5" strokeWidth={1.8} />
            )}
          </button>
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Слушаю..." : "Ask whatever you want"}
            className="flex-1 bg-transparent resize-none outline-none px-3 py-2 min-h-[40px] max-h-[120px] text-[16px] text-white placeholder-[#6b8cbe] overflow-hidden"
            rows={1}
            style={{ paddingTop: '9px', paddingBottom: '9px' }}
          />

          {isLoading ? (
            <button
              onClick={onAbort}
              title="Остановить"
              className="h-[40px] px-4 rounded-xl bg-[#2250a5] text-white flex items-center gap-1.5 text-[14px] font-medium shrink-0 hover:bg-[#2b60c4] transition-colors"
            >
              <Icon.Stop className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              title="Отправить"
              className="h-[40px] w-[40px] rounded-xl bg-[#2250a5] text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2b60c4] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
        {error && (
            <div className="mt-2 text-red-400 text-[13px] bg-red-900/30 border border-red-800/50 px-3 py-2 rounded-xl">
                Ошибка: {error}
            </div>
        )}
      </div>
    </div>
  );
}
