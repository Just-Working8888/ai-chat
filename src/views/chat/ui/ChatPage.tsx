'use client'
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { addMessage, sendMessage, abortRequest } from '../../../entities/message/model/messageSlice';
import { MessageBubble } from '../../../widgets/chat/ui/MessageBubble';
import { ChatInput } from '../../../widgets/chat/ui/ChatInput';
import { ChatHeader } from '../../../widgets/chat/ui/ChatHeader';

const STARTERS = [
  'Объясни простыми словами квантовую запутанность',
  'Идеи для названия кофейни в стиле минимализм',
  'Напиши план презентации на 5 слайдов про ИИ-агенты',
  'Сравни TypeScript и Python для бэкенда',
];

export function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading } = useSelector((state: RootState) => state.message);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: text }));
    abortControllerRef.current = new AbortController();
    const promise = dispatch(sendMessage({ text }));
    abortControllerRef.current.signal.addEventListener('abort', () => promise.abort());
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(abortRequest());
    }
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      abortControllerRef.current = new AbortController();
      const promise = dispatch(sendMessage({ text: lastUserMsg.content }));
      abortControllerRef.current.signal.addEventListener('abort', () => promise.abort());
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[100dvh] min-h-0 bg-[#fafaf9]">
      <ChatHeader />

      <main ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center pt-[min(12vh,80px)] pb-6 px-3"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-[54px] h-[54px] rounded-2xl bg-[#111111] shadow-[0_6px_24px_rgba(0,0,0,0.08)] mb-[22px] relative before:absolute before:bg-white before:rounded-[2px] before:left-[14px] before:right-[14px] before:top-[18px] before:h-[2.5px] after:absolute after:bg-white after:rounded-[2px] after:left-[14px] after:w-[18px] after:top-[26px] after:h-[2.5px]"
              />
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="text-[24px] font-semibold tracking-tight mb-[6px]"
              >
                Начните разговор
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13, duration: 0.25 }}
                className="text-[14px] text-[#71717a] mb-7"
              >
                Введите вопрос или нажмите микрофон
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[620px]">
                {STARTERS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.06, duration: 0.22 }}
                    onClick={() => handleSend(s)}
                    className="appearance-none bg-white border border-[#e7e5e4] p-[14px] rounded-xl flex items-center justify-between gap-2.5 text-[13.5px] text-[#3f3f46] text-left cursor-pointer hover:border-[#d4d4d8] hover:bg-[#f5f5f4] transition-all leading-[1.4]"
                  >
                    <span>{s}</span>
                    <span className="text-[#a1a1aa] text-[14px] shrink-0">↗</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="max-w-[760px] mx-auto p-4 sm:p-8 flex flex-col gap-[18px] pb-6"
            >
              {messages.map((m, i) => {
                const isLastAssistant = m.role === 'ai' && !isLoading && i === messages.length - 1;
                return (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerate}
                  />
                );
              })}

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-stretch"
                  >
                    <div className="flex items-center gap-2 text-[11.5px] text-[#71717a] mb-1.5 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#111111] inline-block" />
                      <span>Ассистент</span>
                    </div>
                    <div className="inline-flex gap-[5px] py-1">
                      <span className="w-[6px] h-[6px] rounded-full bg-[#a1a1aa] animate-bounce-dots" />
                      <span className="w-[6px] h-[6px] rounded-full bg-[#a1a1aa] animate-bounce-dots" style={{ animationDelay: '0.15s' }} />
                      <span className="w-[6px] h-[6px] rounded-full bg-[#a1a1aa] animate-bounce-dots" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ChatInput
        isLoading={isLoading}
        onSend={handleSend}
        onAbort={handleAbort}
      />
    </div>
  );
}
