export const getMemories = () => {
  const memories = localStorage.getItem('memories');
  return memories ? JSON.parse(memories) : [];
};

export const saveMemories = (memories) => {
  localStorage.setItem('memories', JSON.stringify(memories));
};

export const exportData = () => {
  const memories = getMemories();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "memory_jar_backup_" + new Date().toISOString().slice(0, 10) + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedMemories = JSON.parse(event.target.result);
        if (!Array.isArray(importedMemories)) {
          throw new Error("Invalid data format");
        }
        // Merge with existing or replace? Let's replace for simplicity of backup restoration, 
        // but maybe warn user. For now, we'll just return the data and let App decide.
        resolve(importedMemories);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
