import React from 'react';
import { Database, Users, CreditCard, ShoppingCart, MapPin } from 'lucide-react';
import { MasterDataLayout } from './MasterDataLayout';
import { masterSchemas } from '../config/masterSchema';

/**
 * MasterDataManager — 複数のマスタスキーマを切り替えるラッパー
 */
export function MasterDataManager() {
  const [currentKey, setCurrentKey] = React.useState('staffs');
  
  const getIcon = (key: string) => {
    switch(key) {
      case 'staffs': return <Users size={18} />;
      case 'payers': return <CreditCard size={18} />;
      case 'suppliers': return <ShoppingCart size={18} />;
      case 'locations': return <MapPin size={18} />;
      default: return <Database size={18} />;
    }
  };
  
  return (
    <div className="master-manager">
      <nav className="master-tabs">
        {Object.entries(masterSchemas).map(([key, schema]) => (
          <button 
            key={key}
            className={`master-tab-btn ${currentKey === key ? 'active' : ''}`}
            onClick={() => setCurrentKey(key)}
          >
            {getIcon(key)}
            {schema.title}
          </button>
        ))}
      </nav>
      <div className="master-view-content">
        <MasterDataLayout key={currentKey} schema={masterSchemas[currentKey]} />
      </div>
    </div>
  );
}
