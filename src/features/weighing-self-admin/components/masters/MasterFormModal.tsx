/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import type { Item } from '../../types';
import Button from '../ui/Button';
import { X, Search } from 'lucide-react';

export interface FormField {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'tel' | 'email' | 'select' | 'item-selector' | 'radio';
    required?: boolean;
    options?: { value: string; label: string }[];
    step?: number;
    condition?: (formData: any) => boolean;
}

interface ItemSelectorProps {
  allItems: Item[];
  selectedIds: string[];
  onChange: (newSelectedIds: string[]) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({ allItems, selectedIds, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const allItemsMap = useMemo(() => new Map(allItems.map(item => [item.id, item])), [allItems]);
  
  const selectedItems = useMemo(() => 
    selectedIds.map(id => allItemsMap.get(id)).filter(Boolean) as Item[], 
    [selectedIds, allItemsMap]
  );
  
  const handleRemoveItem = (itemId: string) => {
    onChange(selectedIds.filter(id => id !== itemId));
  };
  
  const AddItemModal: React.FC<{onClose: () => void, onAdd: (ids: string[]) => void}> = ({onClose, onAdd}) => {
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [itemsToAdd, setItemsToAdd] = useState<Set<string>>(new Set());
    
    const unselectedItems = useMemo(() => 
      allItems.filter(item => !selectedIds.includes(item.id)),
      [allItems, selectedIds]
    );

    const filteredModalItems = useMemo(() => 
      unselectedItems.filter(item => item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())),
      [unselectedItems, modalSearchTerm]
    );

    const handleToggleItem = (itemId: string) => {
      setItemsToAdd(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    };
    
    const handleConfirmAdd = () => {
      onAdd(Array.from(itemsToAdd));
      onClose();
    };

    return (
      <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-flex tw-items-center tw-justify-center tw-z-[60] tw-p-4 animate-fade-in" onClick={onClose}>
        <div className="tw-bg-background-primary tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-md tw-max-h-[70vh] tw-flex tw-flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <header className="tw-p-4 tw-border-b tw-border-border-default tw-flex tw-justify-between tw-items-center">
            <h3 className="tw-text-lg tw-font-bold">取扱品目を追加</h3>
            <button onClick={onClose} className="tw-p-2 tw-rounded-full hover:tw-bg-background-tertiary tw-transition-colors">
              <X className="tw-w-5 tw-h-5 tw-text-text-secondary" />
            </button>
          </header>
          <main className="tw-p-4 tw-flex-1 tw-overflow-y-auto tw-space-y-3">
            <div className="tw-relative">
              <input type="text" placeholder="品目を検索..." value={modalSearchTerm} onChange={(e) => setModalSearchTerm(e.target.value)}
                className="tw-w-full tw-h-9 tw-pl-8 tw-pr-4 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default" />
              <Search className="tw-absolute tw-left-2 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-text-secondary" />
            </div>
            <div className="tw-space-y-1">
              {filteredModalItems.length > 0 ? filteredModalItems.map(item => (
                <label key={item.id} className="tw-flex tw-items-center tw-p-2 tw-rounded-md hover:tw-bg-background-tertiary tw-cursor-pointer tw-transition-colors">
                  <input type="checkbox" checked={itemsToAdd.has(item.id)} onChange={() => handleToggleItem(item.id)} className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-interactive-default focus:tw-ring-interactive-default"/>
                  <span className="tw-ml-3 tw-text-sm tw-text-text-primary">{item.name}</span>
                </label>
              )) : <p className="tw-text-center tw-text-sm tw-text-text-secondary tw-py-4">追加できる品目がありません。</p>}
            </div>
          </main>
          <footer className="tw-p-4 tw-border-t tw-border-border-default tw-flex tw-justify-end tw-gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button type="button" onClick={handleConfirmAdd} disabled={itemsToAdd.size === 0}>選択した{itemsToAdd.size}件を追加</Button>
          </footer>
        </div>
      </div>
    );
  };

  const handleAddItems = (idsToAdd: string[]) => {
    onChange([...new Set([...selectedIds, ...idsToAdd])]);
  };

  return (
    <div className="tw-space-y-3 tw-p-4 tw-bg-background-tertiary tw-rounded-md tw-border tw-border-border-default">
      <div className="tw-flex tw-items-center tw-justify-between">
         <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>品目を追加</Button>
      </div>
      <div className="tw-min-h-[6rem] tw-p-2 tw-border tw-border-dashed tw-border-border-default tw-rounded-md">
        {selectedItems.length > 0 ? (
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {selectedItems.map(item => (
              <span key={item.id} className="tw-flex tw-items-center tw-bg-interactive-default/10 tw-text-interactive-default tw-text-sm tw-font-medium tw-px-2 tw-py-1 tw-rounded-full">
                {item.name}
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="tw-ml-1.5 tw-p-0.5 tw-rounded-full hover:tw-bg-interactive-default/20">
                  <X className="tw-w-3 tw-h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="tw-text-center tw-text-sm tw-text-text-secondary tw-py-5">
            <p>取扱品目が設定されていません。</p>
            <p>「品目を追加」ボタンから設定してください。</p>
          </div>
        )}
      </div>
      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} onAdd={handleAddItems} />}
    </div>
  );
};


interface MasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  initialData: Record<string, any> | null;
  fields: FormField[];
  title: string;
  allItems: Item[];
  customValidator?: (formData: any) => Record<string, string>;
}

export const MasterFormModal: React.FC<MasterFormModalProps> = ({ isOpen, onClose, onSave, initialData, fields, title, allItems, customValidator }) => {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: any) => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      // Skip validation for fields that are not conditionally rendered
      if (field.condition && !field.condition(data)) {
        return;
      }
      const value = data[field.name];
      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.name] = `${field.label}は必須です。`;
      }
    });

    if (customValidator) {
        const customErrors = customValidator(data);
        Object.assign(newErrors, customErrors);
    }
    return newErrors;
  };

  useEffect(() => {
    if (isOpen) {
        const isDriverForm = fields.some(f => f.name === 'ownerType');
        let ownerType = 'company';
        if (isDriverForm && initialData?.customerId) {
            ownerType = 'customer';
        }

        const newFormData = fields.reduce((acc, field) => {
            const initialValue = initialData ? (initialData as any)[field.name] : undefined;
            if (field.type === 'item-selector') {
                acc[field.name] = Array.isArray(initialValue) ? initialValue : [];
            } else if (field.type === 'number') {
                acc[field.name] = (initialValue !== undefined && initialValue !== null) ? initialValue : '';
            } else {
                acc[field.name] = initialValue || '';
            }
            return acc;
        }, {} as any);

        if (isDriverForm) {
            newFormData.ownerType = ownerType;
            if (ownerType === 'company' && !newFormData.companyId && fields.find(f => f.name === 'companyId')?.options?.[0]) {
              newFormData.companyId = fields.find(f => f.name === 'companyId')?.options?.[0].value;
            }
            if (ownerType === 'customer' && !newFormData.customerId && fields.find(f => f.name === 'customerId')?.options?.[0]) {
              newFormData.customerId = fields.find(f => f.name === 'customerId')?.options?.[0].value;
            }
        }

        setFormData(newFormData);
        const validationErrors = validate(newFormData);
        setErrors(validationErrors);
    }
  }, [initialData, fields, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' && value !== '' ? parseFloat(value) : value;
    
    const newData = { ...formData, [name]: finalValue };

    if (name === 'ownerType') {
        if (value === 'company') {
            newData.customerId = '';
            if (!newData.companyId && fields.find(f => f.name === 'companyId')?.options?.[0]) {
                newData.companyId = fields.find(f => f.name === 'companyId')?.options?.[0].value;
            }
        } else if (value === 'customer') {
            newData.companyId = '';
            if (!newData.customerId && fields.find(f => f.name === 'customerId')?.options?.[0]) {
                newData.customerId = fields.find(f => f.name === 'customerId')?.options?.[0].value;
            }
        }
    }
    
    setFormData(newData);
    const validationErrors = validate(newData);
    setErrors(validationErrors);
  };

  const handleCustomFieldChange = (name: string, value: any) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    const validationErrors = validate(newData);
    setErrors(validationErrors);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
        throw new Error('Validation failed');
    }
    setIsSaving(true);
    try {
      const dataToSave = { ...formData };
        if ('ownerType' in dataToSave) {
            if (dataToSave.ownerType === 'company') {
                delete dataToSave.customerId;
            } else if (dataToSave.ownerType === 'customer') {
                delete dataToSave.companyId;
            }
            delete dataToSave.ownerType;
        }
      await onSave(dataToSave);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4 animate-fade-in" onClick={onClose}>
      <div className="tw-bg-background-primary tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-lg tw-max-h-[90vh] tw-flex tw-flex-col tw-overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <header className="tw-p-6 tw-border-b tw-border-border-default tw-flex tw-justify-between tw-items-center">
          <h2 className="tw-text-xl tw-font-bold">{title}</h2>
          <button onClick={onClose} className="tw-p-2 tw-rounded-full hover:tw-bg-background-tertiary tw-transition-colors">
            <X className="tw-w-5 tw-h-5 tw-text-text-secondary" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="tw-flex-1 tw-flex tw-flex-col tw-overflow-hidden">
          <main className="tw-p-6 tw-space-y-4 tw-flex-1 tw-overflow-y-auto">
            {fields.map(field => {
              if (field.condition && !field.condition(formData)) {
                return null;
              }
              return (
              <div key={field.name}>
                <label htmlFor={field.name} className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">
                  {field.label} {field.required && <span className="tw-text-error">*</span>}
                </label>
                {field.type === 'radio' ? (
                  <div className="tw-flex tw-items-center tw-space-x-6 tw-mt-2">
                    {field.options?.map(opt => (
                      <label key={opt.value} className="tw-flex tw-items-center tw-cursor-pointer">
                        <input
                          type="radio"
                          name={field.name}
                          value={opt.value}
                          checked={formData[field.name] === opt.value}
                          onChange={handleChange}
                          className="tw-h-4 tw-w-4 tw-text-interactive-default tw-border-border-default focus:tw-ring-interactive-default"
                        />
                        <span className="tw-ml-2 tw-text-sm tw-text-text-primary">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className={`tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-rounded-md focus:tw-outline-none tw-transition-colors ${errors[field.name] ? 'tw-border-error' : 'tw-border-border-default focus:tw-border-interactive-default'}`}
                  >
                    {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : field.type === 'item-selector' ? (
                    <ItemSelector
                        allItems={allItems}
                        selectedIds={formData[field.name] || []}
                        onChange={(newValue) => handleCustomFieldChange(field.name, newValue)}
                    />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    step={field.step}
                    className={`tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-rounded-md focus:tw-outline-none tw-transition-colors ${errors[field.name] ? 'tw-border-error' : 'tw-border-border-default focus:tw-border-interactive-default'}`}
                  />
                )}
                {errors[field.name] && <p className="tw-text-sm tw-text-error tw-mt-1">{errors[field.name]}</p>}
              </div>
              )
            })}
          </main>
          <footer className="tw-p-6 tw-border-t tw-border-border-default tw-flex tw-justify-end tw-gap-3 tw-bg-background-tertiary tw-rounded-b-xl">
            <Button type="button" variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button type="submit" loading={isSaving} disabled={Object.keys(errors).length > 0}>保存</Button>
          </footer>
        </form>
         <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.2s ease-out; }
          .animate-slide-up { animation: slide-up 0.2s ease-out; }
        `}</style>
      </div>
    </div>
  );
};
