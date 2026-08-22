import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const KANA_GROUPS = [
  { label: 'あ', regex: /^[あいうえお]/ },
  { label: 'か', regex: /^[かきくけこがぎぐげご]/ },
  { label: 'さ', regex: /^[さしすせそざじずぜぞ]/ },
  { label: 'た', regex: /^[たちつてとだぢづでど]/ },
  { label: 'な', regex: /^[なにぬねの]/ },
  { label: 'は', regex: /^[はひふへほばびぶべぼぱぴぷぺぽ]/ },
  { label: 'ま', regex: /^[まみむめも]/ },
  { label: 'や', regex: /^[やゆよ]/ },
  { label: 'ら', regex: /^[らりるれろ]/ },
  { label: 'わ', regex: /^[わをん]/ },
];

export default function SearchableMultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "検索して選択..." 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeKanaFilter, setActiveKanaFilter] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // 領域外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setActiveKanaFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => {
    const matchText = (option.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchKana = true;
    if (activeKanaFilter) {
      if (!option.kana) {
        matchKana = false; // kanaがない古いデータはフィルタから外す
      } else {
        matchKana = activeKanaFilter.regex.test(option.kana);
      }
    }
    return matchText && matchKana;
  });

  const selectedOptions = options.filter(option => value.includes(option.id));

  const toggleOption = (id) => {
    const newValue = value.includes(id) 
      ? value.filter(v => v !== id) 
      : [...value, id];
    onChange(newValue);
  };

  const removeOption = (e, id) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className="relative w-full text-sm" ref={containerRef}>
      {/* 選択済みタグ＆入力フィールド */}
      <div 
        className={`min-h-[42px] border rounded bg-white p-1.5 flex flex-wrap gap-1.5 items-center cursor-text transition-colors ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-300'}`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedOptions.map(option => (
          <span 
            key={option.id} 
            className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold"
          >
            {option.name}
            <button 
              type="button"
              onClick={(e) => removeOption(e, option.id)}
              className="text-emerald-500 hover:text-emerald-700 focus:outline-none"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}
        
        <div className="flex-1 min-w-[120px] flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none p-1 text-sm text-gray-700"
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
          />
        </div>
        <div className="text-gray-400 px-1">
          <ChevronDown size={16} />
        </div>
      </div>

      {/* ドロップダウンリスト */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col">
          
          {/* 五十音フィルター */}
          <div className="p-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {KANA_GROUPS.map(group => (
              <button
                key={group.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveKanaFilter(activeKanaFilter?.label === group.label ? null : group);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeKanaFilter?.label === group.label 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                見つかりませんでした
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map(option => {
                  const isSelected = value.includes(option.id);
                  return (
                    <li 
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`truncate ${isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                        {option.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
