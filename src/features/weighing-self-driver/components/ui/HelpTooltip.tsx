import React, { useState } from 'react';
import { Info } from 'lucide-react';
import Modal from './Modal';

interface HelpTooltipProps {
  title: string;
  children: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
        aria-label={`${title}のヘルプを表示`}
      >
        <Info size={22} />
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      >
        {children}
      </Modal>
    </>
  );
};

export default HelpTooltip;
