'use client'
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { addMessage, sendMessage, abortRequest } from '../../../entities/message/model/messageSlice';
import { MessageBubble } from '../../../widgets/chat/ui/MessageBubble';
import { ChatInput } from '../../../widgets/chat/ui/ChatInput';
import { ChatHeader } from '../../../widgets/chat/ui/ChatHeader';



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
    <div className="flex flex-col h-[100dvh] min-h-0 bg-[#0b2253] text-white">
      {hasMessages && <ChatHeader />}

      <main ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start pt-[min(15vh,100px)] pb-6 px-6 sm:px-12 max-w-[800px] mx-auto w-full"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-[46px] h-[46px] rounded-[14px] bg-[#2250a5] mb-8 flex items-center justify-center shrink-0 shadow-sm"
              >
                <div className="text-white">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="text-[26px] font-medium tracking-tight mb-4"
              >
                Hi there!
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13, duration: 0.25 }}
                className="text-[36px] sm:text-[42px] font-semibold tracking-tight mb-5 leading-tight"
              >
                What would you like to know?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.25 }}
                className="text-[17px] text-[#869fc4] leading-relaxed max-w-[400px]"
              >
                Use one of the most common prompts below<br/>or ask your own question
              </motion.p>
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
                    <div className="flex items-center gap-2 text-[12px] text-[#869fc4] mb-2 tracking-wide font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#869fc4] inline-block" />
                      <span>Ассистент</span>
                    </div>
                    <div className="inline-flex gap-[5px] py-1">
                      <span className="w-[6px] h-[6px] rounded-full bg-[#869fc4] animate-bounce-dots" />
                      <span className="w-[6px] h-[6px] rounded-full bg-[#869fc4] animate-bounce-dots" style={{ animationDelay: '0.15s' }} />
                      <span className="w-[6px] h-[6px] rounded-full bg-[#869fc4] animate-bounce-dots" style={{ animationDelay: '0.3s' }} />
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
