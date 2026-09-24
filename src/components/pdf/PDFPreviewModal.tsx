import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { PrintableDispatchDocument } from './PrintableDispatchDocument';
import { PrintableDispatchSheetData, buildPrintableData } from '../../utils/printUtils';
import { Job, Customer, Driver } from '../../types';
import { registerPdfFonts } from '../../utils/pdfFonts';

// 初期化フラグ
let fontsRegistered = false;

interface PDFPreviewModalProps {
  driverId: string;
  drivers: Driver[];
  jobs: Job[];
  customers: Customer[];
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  driverId,
  drivers,
  jobs,
  customers,
  onClose,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!fontsRegistered) {
      try {
        registerPdfFonts();
        fontsRegistered = true;
      } catch (e) {
        console.error('Failed to register fonts:', e);
      }
    }
    setIsReady(true);
  }, []);

  const data = useMemo<PrintableDispatchSheetData | null>(() => {
    return buildPrintableData(driverId, drivers, jobs, customers);
  }, [driverId, drivers, jobs, customers]);

  if (!data || !isReady) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#333' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>回収運行指示書 PDFプレビュー</h2>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          閉じる
        </button>
      </div>
      <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <PDFViewer style={{ width: '100%', maxWidth: '1000px', height: '100%', border: 'none' }}>
          <PrintableDispatchDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
