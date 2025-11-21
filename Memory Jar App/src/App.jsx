import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MemoryForm from './components/MemoryForm';
import MemoryCard from './components/MemoryCard';
import SearchBar from './components/SearchBar';
import { getMemories, saveMemories, exportData, importData } from './utils/storage';
import { AnimatePresence, motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { Download, Upload } from 'lucide-react';

function App() {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const fileInputRef = useRef(null);

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  useEffect(() => {
    const loadedMemories = getMemories();
    // Sort by date (newest first) - assuming ID is timestamp-based or adding a createdAt field would be better, 
    // but for now we'll rely on the array order or reverse it if needed. 
    // Actually, let's sort by the 'id' since it's Date.now() in the current implementation.
    const sortedMemories = loadedMemories.sort((a, b) => b.id - a.id);
    setMemories(sortedMemories);
  }, []);

  useEffect(() => {
    saveMemories(memories);
  }, [memories]);

  // Filter logic
  useEffect(() => {
    let result = memories;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(mem =>
        mem.title.toLowerCase().includes(lowerQuery) ||
        mem.text.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedTag) {
      result = result.filter(mem => mem.tags && mem.tags.includes(selectedTag));
    }

    setFilteredMemories(result);
  }, [memories, searchQuery, selectedTag]);

  // Get all unique tags
  const availableTags = [...new Set(memories.flatMap(mem => mem.tags || []))];

  const addMemory = (memory) => {
    setMemories((prev) => [memory, ...prev]);
  };

  const updateMemory = (updatedMemory) => {
    setMemories((prev) =>
      prev.map((mem) => (mem.id === updatedMemory.id ? updatedMemory : mem))
    );
  };

  const deleteMemory = (id) => {
    setMemories((prev) => prev.filter((mem) => mem.id !== id));
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const importedData = await importData(file);
        setMemories(importedData); // Replace memories
        alert('Memories imported successfully!');
      } catch (error) {
        alert('Failed to import data: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink-100 via-pastel-champagne to-pastel-gray-green py-8 px-4 font-sans text-slate-800">
      <Header />

      {/* Data Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
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

      <main className="container mx-auto max-w-4xl">
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
