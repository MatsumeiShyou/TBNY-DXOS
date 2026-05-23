import React from 'react';
import type { Item } from '../../types';
import { X } from 'lucide-react';
import Card from '../ui/Card';

interface ItemFilterProps {
  allItems: Item[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const ItemFilter: React.FC<ItemFilterProps> = ({ allItems, selectedIds, onSelectionChange }) => {
  const handleToggle = (itemId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(itemId)) {
      newSelectedIds.delete(itemId);
    } else {
      newSelectedIds.add(itemId);
    }
    onSelectionChange(Array.from(newSelectedIds));
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  const allSelected = allItems.length > 0 && selectedIds.length === allItems.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allItems.map(item => item.id));
    }
  };

  return (
    <Card className="tw-p-4">
      <div className="tw-flex tw-items-center tw-gap-4">
        <h3 className="tw-text-sm tw-font-semibold tw-text-text-secondary tw-whitespace-nowrap">品目フィルタ:</h3>
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-flex-1">
          <button
            onClick={handleSelectAll}
            className={`tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-rounded-full tw-transition-colors tw-duration-200 tw-border ${
              allSelected
                ? 'tw-bg-interactive-default tw-text-white tw-border-interactive-default'
                : 'tw-bg-transparent tw-text-text-primary tw-border-border-default hover:tw-bg-background-tertiary'
            }`}
          >
            全て
          </button>
          {allItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-rounded-full tw-transition-colors tw-duration-200 tw-border ${
                  isSelected
                    ? 'tw-bg-interactive-default tw-text-white tw-border-interactive-default'
                    : 'tw-bg-transparent tw-text-text-primary tw-border-border-default hover:tw-bg-background-tertiary'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleClear}
            className="tw-flex tw-items-center tw-gap-1 tw-text-sm tw-text-text-secondary hover:tw-text-error tw-transition-colors tw-p-2 tw-rounded-md"
            aria-label="フィルタをクリア"
          >
            <X className="tw-w-4 tw-h-4" />
            クリア
          </button>
        )}
      </div>
    </Card>
  );
};

export default ItemFilter;
