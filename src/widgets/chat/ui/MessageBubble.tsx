'use client'
import { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../../shared/lib/utils';
import { Message } from '../../../entities/message/model/types';
import { Icon } from '../../../shared/ui/icons';

interface MessageBubbleProps {
  message: Message;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

export function MessageBubble({ message, isLastAssistant, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (isError) {
    return (
      <motion.div {...fadeUp} className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 max-w-[560px]">
        <Icon.AlertCircle className="text-red-500 shrink-0 mt-[1px]" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-red-700 mb-0.5">Ошибка</p>
          <p className="text-[13px] text-red-600 leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  if (isUser) {
    return (
      <motion.div {...fadeUp} className="flex flex-col items-end">
        <div className="bg-[#111111] text-white px-3.5 py-2.5 rounded-[14px] rounded-br-[6px] max-w-[85%] sm:max-w-[560px] whitespace-pre-wrap break-words text-[15px]">
          {message.content.split('\n').map((line, i) => <div key={i}>{line || '\u00A0'}</div>)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} className="flex flex-col items-stretch group">
      <div className="flex items-center gap-2 text-[11.5px] text-[#71717a] mb-1.5 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-[#111111] inline-block" />
        <span>Ассистент</span>
      </div>
      <div className={cn('text-[#3f3f46] text-[15px] prose max-w-none')}>
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      {message.content && (
        <div className="flex gap-1 mt-2 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={handleCopy}
            title="Скопировать"
            className="appearance-none border-0 bg-transparent text-[#71717a] text-[11.5px] inline-flex items-center gap-[5px] py-1 px-2 rounded-lg cursor-pointer hover:bg-[#f5f5f4] hover:text-[#3f3f46] transition-colors"
          >
            {copied ? <Icon.Check className="w-[13px] h-[13px]" /> : <Icon.Copy className="w-[13px] h-[13px]" />}
            <span>{copied ? 'Скопировано' : 'Скопировать'}</span>
          </button>
          {isLastAssistant && onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Перегенерировать"
              className="appearance-none border-0 bg-transparent text-[#71717a] text-[11.5px] inline-flex items-center gap-[5px] py-1 px-2 rounded-lg cursor-pointer hover:bg-[#f5f5f4] hover:text-[#3f3f46] transition-colors"
            >
              <Icon.Refresh className="w-[13px] h-[13px]" />
              <span>Перегенерировать</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
