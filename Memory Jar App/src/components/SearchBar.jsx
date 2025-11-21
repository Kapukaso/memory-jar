import React from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchBar = ({ searchQuery, setSearchQuery, selectedTag, setSelectedTag, availableTags }) => {
    return (
        <div className="mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-pastel-white-pink/40 text-slate-700 placeholder-slate-500 focus:outline-none focus:bg-pastel-white-pink/60 focus:ring-0 transition-colors backdrop-blur-sm shadow-inner"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Tags Scroll */}
            {availableTags.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTag === null
                            ? 'bg-pastel-peach text-white shadow-md'
                            : 'bg-pastel-white-pink/40 text-slate-600 hover:bg-pastel-white-pink/60'
                            }`}
                    >
                        All
                    </button>
                    {availableTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedTag === tag
                                ? 'bg-pastel-peach text-white shadow-md'
                                : 'bg-pastel-white-pink/40 text-slate-600 hover:bg-pastel-white-pink/60'
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
