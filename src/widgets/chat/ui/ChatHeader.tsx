'use client'
import { useDispatch, useSelector } from 'react-redux';
import { clearMessages } from '../../../entities/message/model/messageSlice';
import { RootState } from '../../../store/store';
import { Icon } from '../../../shared/ui/icons';

export function ChatHeader() {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.message.messages);
  const hasMessages = messages.length > 0;

  const handleClear = () => {
    if (confirm('Удалить всю историю чата?')) {
      dispatch(clearMessages());
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-[22px] py-[14px] border-b border-[#1d3d82] bg-[#0b2253]/85 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[34px] h-[34px] rounded-[10px] bg-[#2250a5] text-white flex items-center justify-center shrink-0">
          <Icon.MessageCircle />
        </div>
    
      </div>
      <div className="flex items-center gap-2">
        <button 
          disabled={!hasMessages}
          onClick={handleClear}
          title="Очистить чат"
          className="h-[30px] px-2.5 rounded-full border border-[#1d3d82] bg-transparent text-[#869fc4] flex items-center gap-1.5 text-[11.5px] cursor-pointer hover:bg-[#102d6b] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon.Trash className="w-[14px] h-[14px]" />
        </button>
      </div>
    </header>
  );
}
