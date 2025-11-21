import { supabase } from '../supabaseClient';

// --- Local Storage (Legacy/Backup) ---
export const getMemories = () => {
  const memories = localStorage.getItem('memories');
  return memories ? JSON.parse(memories) : [];
};

export const saveMemories = (memories) => {
  localStorage.setItem('memories', JSON.stringify(memories));
};

// --- Supabase (Cloud) ---

// Generate or get existing Jar ID
export const getJarId = () => {
  let jarId = localStorage.getItem('jar_id');
  if (!jarId) {
    jarId = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('jar_id', jarId);
  }
  return jarId;
};

export const setJarId = (id) => {
  localStorage.setItem('jar_id', id);
};

// Fetch memories for the current Jar
export const fetchMemories = async (jarId) => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('jar_id', jarId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map DB columns back to frontend props
  return data.map(mem => ({
    ...mem,
    image: mem.image_url,
    audio: mem.audio_url
  }));
};

// Add a memory to the Cloud
export const addMemoryToCloud = async (memory, jarId) => {
  // Map frontend props to DB columns
  const dbMemory = {
    title: memory.title,
    text: memory.text,
    date: memory.date,
    image_url: memory.image,
    audio_url: memory.audio,
    tags: memory.tags,
    jar_id: jarId
  };

  const { data, error } = await supabase
    .from('memories')
    .insert([dbMemory])
    .select();

  if (error) throw error;

  // Return mapped back
  return {
    ...data[0],
    image: data[0].image_url,
    audio: data[0].audio_url
  };
};

// Update a memory in the Cloud
export const updateMemoryInCloud = async (memory) => {
  const dbMemory = {
    title: memory.title,
    text: memory.text,
    date: memory.date,
    image_url: memory.image,
    audio_url: memory.audio,
    tags: memory.tags
  };

  const { data, error } = await supabase
    .from('memories')
    .update(dbMemory)
    .eq('id', memory.id)
    .select();

  if (error) throw error;

  return {
    ...data[0],
    image: data[0].image_url,
    audio: data[0].audio_url
  };
};

// Delete a memory
export const deleteMemoryFromCloud = async (id) => {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Upload file to Supabase Storage
export const uploadFile = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Upload Base64 Audio
export const uploadAudio = async (blob) => {
  const fileName = `audio_${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, blob);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// --- Export/Import (Legacy) ---
export const exportData = () => {
  const memories = getMemories();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "memory_jar_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedMemories = JSON.parse(event.target.result);
        // Basic validation
        if (!Array.isArray(importedMemories)) throw new Error("Invalid format");
        resolve(importedMemories);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// --- Jar History (Saved Jars) ---
export const getJarHistory = () => {
  const history = localStorage.getItem('jar_history');
  return history ? JSON.parse(history) : [];
};

export const addJarToHistory = (jarId) => {
  const history = getJarHistory();
  // Remove if exists (to move to top)
  const filtered = history.filter(id => id !== jarId);
  // Add to front
  const newHistory = [jarId, ...filtered].slice(0, 5); // Keep last 5
  localStorage.setItem('jar_history', JSON.stringify(newHistory));
};

export const removeJarFromHistory = (jarId) => {
  const history = getJarHistory();
  const newHistory = history.filter(id => id !== jarId);
  localStorage.setItem('jar_history', JSON.stringify(newHistory));
};
