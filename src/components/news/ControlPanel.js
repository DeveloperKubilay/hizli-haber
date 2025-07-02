import React from 'react';
import { BarChart3, Heart, ChevronDown, Calendar, AlignLeft, Grid, List } from 'lucide-react';

function ControlPanel({ 
  sortBy, 
  setSortBy, 
  itemsPerPage, 
  setItemsPerPage, 
  currentPage, 
  setCurrentPage,
  showSortDropdown,
  setShowSortDropdown,
  showViewDropdown,
  setShowViewDropdown,
  viewMode,
  setViewMode
}) {
  const sortOptions = [
    { value: 'tarih', label: 'Tarihe göre', icon: <Calendar size={16} /> },
    { value: 'baslik', label: 'Başlığa göre', icon: <AlignLeft size={16} /> },
    { value: 'begeniler', label: 'Beğenilere göre', icon: <Heart size={16} /> }
  ];

  const viewOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Sol taraf - Sort by ve View */}
      <div className="flex items-center gap-4">
        {/* Sıralama */}
        <div className="relative">
          <div 
            className="bg-primaryBG rounded-full px-4 py-3 border border-primaryBG cursor-pointer hover:border-secondary transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setShowSortDropdown(!showSortDropdown);
              setShowViewDropdown(false);
            }}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span className="text-textPrimary text-sm font-medium">Sırala:</span>
              <span className="text-textPrimary text-sm">
                {sortOptions.find(option => option.value === sortBy)?.label}
              </span>
              <ChevronDown size={14} className={`text-textPrimary transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {/* Custom Dropdown */}
          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-primary border border-primaryBG rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      sortBy === option.value 
                        ? 'bg-secondaryBG text-secondary border border-secondary hover:text-secondaryHover hover:bg-selectBox' 
                        : 'text-textPrimary hover:text-textHeading hover:bg-primaryBG'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Görüntüleme */}
        <div className="relative">
          <div 
            className="bg-primaryBG rounded-full px-4 py-3 border border-primaryBG cursor-pointer hover:border-secondary transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setShowViewDropdown(!showViewDropdown);
              setShowSortDropdown(false);
            }}
          >
            <div className="flex items-center gap-2">
              <Heart size={16} />
              <span className="text-textPrimary text-sm font-medium">Göster:</span>
              <span className="text-textPrimary text-sm">{itemsPerPage}</span>
              <ChevronDown size={14} className={`text-textPrimary transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {/* Custom Dropdown */}
          {showViewDropdown && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-primary border border-primaryBG rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-1.5">
                {viewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemsPerPage(option.value);
                      setCurrentPage(1);
                      setShowViewDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      itemsPerPage === option.value 
                        ? 'bg-secondaryBG text-secondary border border-secondary hover:text-secondaryHover hover:bg-selectBox' 
                        : 'text-textPrimary hover:text-textHeading hover:bg-primaryBG'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Görünüm modu butonları */}
      <div className="flex">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-3 rounded-l-full border border-primaryBG cursor-pointer transition-all ${
            viewMode === 'grid' 
              ? 'bg-secondaryBG text-secondary border-secondary hover:text-secondaryHover hover:bg-selectBox' 
              : 'bg-primaryBG text-textPrimary hover:text-textHeading hover:border-secondary'
          }`}
          title="Grid görünümü"
        >
          <Grid size={16} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-3 rounded-r-full border border-primaryBG cursor-pointer transition-all ${
            viewMode === 'list' 
              ? 'bg-secondaryBG text-secondary border-secondary hover:text-secondaryHover hover:bg-selectBox' 
              : 'bg-primaryBG text-textPrimary hover:text-textHeading hover:border-secondary'
          }`}
          title="Liste görünümü"
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
