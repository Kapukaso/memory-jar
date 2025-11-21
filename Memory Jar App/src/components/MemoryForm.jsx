import React, { useState, useRef } from 'react';
import { Camera, Mic, Save, X, ImageIcon, Loader2, StopCircle, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { startRecording, stopRecording } from '../utils/recorder';
import { compressImage } from '../utils/helpers';
import { uploadFile, uploadAudio } from '../utils/storage';

const MemoryForm = ({ addMemory, currentMemory, updateMemory, setEditingMemory }) => {
  const [title, setTitle] = useState(currentMemory ? currentMemory.title : '');
  const [text, setText] = useState(currentMemory ? currentMemory.text : '');
  const [image, setImage] = useState(currentMemory ? currentMemory.image : '');
  const [imageFile, setImageFile] = useState(null); // Store raw file for upload
  const [audioBase64, setAudioBase64] = useState(currentMemory ? currentMemory.audio : null);
  const [audioBlob, setAudioBlob] = useState(null); // Store raw blob for upload
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tags, setTags] = useState(currentMemory && currentMemory.tags ? currentMemory.tags.join(', ') : '');

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      try {
        // Keep local preview
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
        setImageFile(file); // Store file for cloud upload
      } catch (error) {
        console.error("Image processing error:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsProcessing(true);
      try {
        const base64Audio = await stopRecording();
        if (base64Audio) {
          setAudioBase64(base64Audio);
        }
      } catch (error) {
        console.error("Recording failed", error);
      } finally {
        setIsRecording(false);
        setIsProcessing(false);
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error("Could not start recording", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let imageUrl = image;
      let audioUrl = audioBase64;

      // Upload Image if new file exists
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      // Upload Audio if new blob exists
      if (audioBlob) {
        audioUrl = await uploadAudio(audioBlob);
      }

      const processedTags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

      const memoryData = {
        id: currentMemory ? currentMemory.id : undefined, // ID handled by DB for new
        title,
        text,
        image: imageUrl, // Now a URL
        audio: audioUrl, // Now a URL
        date: currentMemory ? currentMemory.date : new Date().toLocaleDateString(),
        tags: processedTags
      };

      if (currentMemory) {
        updateMemory(memoryData);
        setEditingMemory(null);
      } else {
        await addMemory(memoryData);
      }

      // Reset form
      setTitle('');
      setText('');
      setImage('');
      setImageFile(null);
      setAudioBase64(null);
      setAudioBlob(null);
      setTags('');
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Error saving memory: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-pastel-white-pink/60 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/60 mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-700 drop-shadow-sm">
          {currentMemory ? 'Edit Memory' : 'New Memory'}
        </h2>
        {currentMemory && (
          <button
            type="button"
            onClick={() => setEditingMemory(null)}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title your memory..."
          className="w-full bg-white/50 border-0 rounded-xl p-4 text-lg placeholder-slate-400 text-slate-700 focus:ring-2 focus:ring-pastel-peach focus:bg-white/70 transition-all outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          rows="3"
          placeholder="What happened?"
          className="w-full bg-white/50 border-0 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-pastel-peach focus:bg-white/70 transition-all outline-none resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        ></textarea>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tags (comma separated, e.g. travel, fun)"
            className="w-full bg-white/50 border-0 rounded-xl pl-10 p-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-pastel-peach focus:bg-white/70 transition-all outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Media Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Image Upload */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex items - center gap - 2 px - 4 py - 2 rounded - full transition - all ${image ? 'bg-pastel-gray-green text-slate-700' : 'bg-white/60 text-slate-600 hover:bg-white/80'
                } `}
            >
              <ImageIcon size={20} />
              {image ? 'Change Photo' : 'Add Photo'}
            </button>
          </div>

          {/* Audio Recording */}
          <button
            type="button"
            onClick={handleRecordToggle}
            disabled={isProcessing}
            className={`flex items - center gap - 2 px - 4 py - 2 rounded - full transition - all ${isRecording
              ? 'bg-red-400 text-white animate-pulse'
              : audioBase64
                ? 'bg-pastel-gray-green text-slate-700'
                : 'bg-white/60 text-slate-600 hover:bg-white/80'
              } `}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop' : audioBase64 ? 'Re-record' : 'Record Voice'}
          </button>
        </div>

        {/* Previews */}
        <div className="space-y-3">
          {image && (
            <div className="relative inline-block">
              <img src={image} alt="Preview" className="h-32 w-auto rounded-xl shadow-md object-cover border-2 border-white" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1 shadow-sm hover:bg-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {audioBase64 && !isRecording && (
            <div className="bg-white/40 p-3 rounded-xl flex items-center gap-2">
              <audio controls src={audioBase64} className="w-full h-8" />
              <button
                type="button"
                onClick={() => setAudioBase64(null)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pastel-peach to-pastel-pink-200 hover:from-pastel-apricot hover:to-pastel-pink-100 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {currentMemory ? 'Update Memory' : 'Save Memory'}
        </button>
      </div>
    </motion.form>
  );
};

export default MemoryForm;
