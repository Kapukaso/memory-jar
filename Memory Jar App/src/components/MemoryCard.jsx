import React, { useState } from 'react';
import { Edit2, Trash2, Play, Pause, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const MemoryCard = ({ memory, onEdit, onDelete, onTagClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-pastel-white-pink/60 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/60 hover:bg-pastel-white-pink/80 transition-colors break-inside-avoid mb-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-slate-800">{memory.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(memory)}
            className="p-2 bg-white/50 rounded-full hover:bg-white/80 text-pastel-peach transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="p-2 bg-white/50 rounded-full hover:bg-red-100 text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-slate-700 mb-4 leading-relaxed">{memory.text}</p>

      {memory.image && (
        <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-white/30">
          <img src={memory.image} alt={memory.title} className="w-full h-auto object-cover" />
        </div>
      )}

      {memory.audio && (
        <div className="mb-4 bg-white/50 rounded-xl p-3 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-pastel-peach text-white flex items-center justify-center shadow-md hover:bg-pastel-apricot transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            {/* Simple visualizer placeholder - in a real app we'd track progress */}
            <div className={`h-full bg-pastel-peach transition-all duration-300 ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`} />
          </div>
          <audio
            ref={audioRef}
            src={memory.audio}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {memory.tags && memory.tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick && onTagClick(tag)}
            className="px-2 py-1 bg-pastel-champagne/60 text-slate-600 text-xs rounded-full hover:bg-pastel-champagne transition-colors flex items-center gap-1 font-medium"
          >
            <Tag size={10} />
            {tag}
          </button>
        ))}
      </div>

      <div className="flex items-center text-slate-500 text-xs font-medium mt-2">
        <Calendar size={14} className="mr-1" />
        {memory.date}
      </div>
    </motion.div>
  );
};

export default MemoryCard;
