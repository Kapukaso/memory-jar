import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MemoryForm from './components/MemoryForm';
import MemoryCard from './components/MemoryCard';
import SearchBar from './components/SearchBar';
import {
  getJarId,
  setJarId,
  fetchMemories,
  deleteMemoryFromCloud,
  addMemoryToCloud,
  updateMemoryInCloud,
  exportData,
  importData,
  getJarHistory,
  addJarToHistory,
  removeJarFromHistory
} from './utils/storage';
import { supabase } from './supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { Download, Upload, Users, LogOut, ArrowRight, History, Trash2 } from 'lucide-react';
import BackgroundCarousel from './components/BackgroundCarousel';

function App() {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [jarId, setJarIdState] = useState(null);
  const [joinInput, setJoinInput] = useState('');
  const [savedJars, setSavedJars] = useState([]);
  const fileInputRef = useRef(null);

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  // Check for existing Jar ID on load
  useEffect(() => {
    const existingId = localStorage.getItem('jar_id');
    if (existingId) {
      setJarIdState(existingId);
      addJarToHistory(existingId); // Ensure current is in history
    }
    setSavedJars(getJarHistory());
  }, []);

  // Real-time Sync with Supabase
  useEffect(() => {
    if (!jarId) return;

    // Initial fetch
    fetchMemories(jarId)
      .then(setMemories)
      .catch(err => {
        console.error("Fetch Error:", err);
        alert("Failed to load memories. Check if you ran the SQL script in Supabase! Error: " + err.message);
      });

    // Real-time subscription
    const channel = supabase
      .channel('public:memories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories', filter: `jar_id=eq.${jarId}` }, (payload) => {
        console.log('Change received!', payload);
        fetchMemories(jarId).then(setMemories);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase Realtime');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Supabase Realtime connection error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jarId]);

  // Filter logic
  useEffect(() => {
    let result = memories;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(mem =>
        (mem.title && mem.title.toLowerCase().includes(lowerQuery)) ||
        (mem.text && mem.text.toLowerCase().includes(lowerQuery))
      );
    }

    if (selectedTag) {
      result = result.filter(mem => mem.tags && mem.tags.includes(selectedTag));
    }

    setFilteredMemories(result);
  }, [memories, searchQuery, selectedTag]);

  // Get all unique tags
  const availableTags = [...new Set(memories.flatMap(mem => mem.tags || []))];

  const handleCreateJar = () => {
    const newId = getJarId(); // Generates if not exists, but we want to force a new one if they are creating
    const freshId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJarId(freshId);
    setJarIdState(freshId);
    addJarToHistory(freshId);
  };

  const handleJoinJar = (e) => {
    e.preventDefault();
    if (joinInput.trim().length > 0) {
      const id = joinInput.trim().toUpperCase();
      setJarId(id);
      setJarIdState(id);
      addJarToHistory(id);
    }
  };

  const handleRejoinJar = (id) => {
    setJarId(id);
    setJarIdState(id);
    addJarToHistory(id);
  };

  const handleRemoveHistory = (e, id) => {
    e.stopPropagation();
    removeJarFromHistory(id);
    setSavedJars(getJarHistory());
  };

  const handleLogout = () => {
    localStorage.removeItem('jar_id');
    setJarIdState(null);
    setMemories([]);
    setSavedJars(getJarHistory()); // Refresh list on logout
  };

  const [isLoading, setIsLoading] = useState(false);

  const addMemory = async (memory) => {
    setIsLoading(true);
    try {
      const newMemory = await addMemoryToCloud(memory, jarId);
      setMemories(prev => [newMemory, ...prev]);
    } catch (error) {
      console.error("Add Memory Error:", error);
      alert('Error adding memory: ' + (error.message || error.error_description || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemory = async (updatedMemory) => {
    setIsLoading(true);
    try {
      const savedMemory = await updateMemoryInCloud(updatedMemory);
      setMemories(prev => prev.map(mem => mem.id === savedMemory.id ? savedMemory : mem));
      setEditingMemory(null);
    } catch (error) {
      console.error("Update Memory Error:", error);
      alert('Error updating memory: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMemory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      await deleteMemoryFromCloud(id);
      setMemories(prev => prev.filter(mem => mem.id !== id));
    } catch (error) {
      console.error("Delete Memory Error:", error);
      alert('Error deleting memory: ' + error.message);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const importedData = await importData(file);
        // For cloud, we should probably loop and upload them?
        // Or just set them locally? Let's just warn user.
        alert('Importing to cloud is not fully supported yet. These will only show until refresh.');
        setMemories(importedData);
      } catch (error) {
        alert('Failed to import data: ' + error.message);
      }
    }
  };

  if (!jarId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink-100 via-pastel-champagne to-pastel-gray-green flex items-center justify-center p-4">
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/60 text-center">
          <Header />
          <h2 className="text-2xl font-bold text-slate-700 mb-6">Welcome to Memory Jar</h2>

          <button
            onClick={handleCreateJar}
            className="w-full bg-pastel-peach text-white font-bold py-3 px-6 rounded-xl shadow-lg mb-6 hover:bg-pastel-apricot transition-colors flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Create New Jar
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          <form onSubmit={handleJoinJar} className="space-y-4 mb-6">
            <label className="block text-left text-slate-600 font-medium ml-1">Join Partner's Jar</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Jar ID"
                className="flex-1 bg-white/60 border-0 rounded-xl p-3 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-pastel-peach outline-none uppercase"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-white/60 text-slate-700 p-3 rounded-xl hover:bg-white/80 transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </form>

          {/* Saved Jars History */}
          {savedJars.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-left text-slate-500 font-medium mb-3 flex items-center gap-2">
                <History size={16} />
                Recent Jars
              </h3>
              <div className="space-y-2">
                {savedJars.map(id => (
                  <div key={id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejoinJar(id)}
                      className="flex-1 bg-white/40 hover:bg-white/60 p-3 rounded-xl text-left text-slate-700 font-mono transition-colors flex items-center justify-between group"
                    >
                      <span>{id}</span>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-pastel-peach" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveHistory(e, id)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink-100 via-pastel-champagne to-pastel-gray-green py-8 px-4 font-sans text-slate-800 relative overflow-hidden">

      {/* Background Carousel */}
      <BackgroundCarousel memories={memories} />

      <Header />

      {/* Jar ID & Controls */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-slate-700 font-bold shadow-lg border border-white/50 flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">Jar ID:</span>
          <span className="font-mono text-lg select-all">{jarId}</span>
        </div>
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleLogout}
          className="p-2 bg-white/40 backdrop-blur-md rounded-full text-slate-700 hover:bg-red-100 hover:text-red-500 transition-colors shadow-lg"
          title="Exit Jar"
        >
          <LogOut size={20} />
        </button>
        <button
          onClick={exportData}
          className="p-2 bg-white/40 backdrop-blur-md rounded-full text-slate-700 hover:bg-white/60 transition-colors shadow-lg"
          title="Export Memories"
        >
          <Download size={20} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white/40 backdrop-blur-md rounded-full text-slate-700 hover:bg-white/60 transition-colors shadow-lg"
          title="Import Memories"
        >
          <Upload size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          className="hidden"
        />
      </div>

      <main className="container mx-auto max-w-4xl mt-12">
        <MemoryForm
          addMemory={addMemory}
          currentMemory={editingMemory}
          updateMemory={updateMemory}
          setEditingMemory={setEditingMemory}
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          availableTags={availableTags}
        />

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-6"
          columnClassName="pl-6 bg-clip-padding"
        >
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={setEditingMemory}
              onDelete={deleteMemory}
              onTagClick={setSelectedTag}
            />
          ))}
        </Masonry>

        {filteredMemories.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-600 italic mt-10 font-medium"
          >
            {memories.length === 0 ? "The jar is empty. Add a memory to start." : "No memories found matching your search."}
          </motion.p>
        )}
      </main>
    </div>
  );
}

export default App;
