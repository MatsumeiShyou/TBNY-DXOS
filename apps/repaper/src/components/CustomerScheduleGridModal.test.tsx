import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CustomerScheduleGridModal from './CustomerScheduleGridModal';

describe('CustomerScheduleGridModal', () => {
  const mockCustomers = [
    { id: '1', name: 'Test Customer 1', jobType: 'spot' } as any
  ];
  const mockVehicles = [
    { id: 'v1', name: '2t車' }
  ];

  it('renders tabs and switches between them', () => {
    render(
      <CustomerScheduleGridModal 
        customers={mockCustomers} 
        masterVehicles={mockVehicles}
        onSave={vi.fn()} 
        onClose={vi.fn()} 
      />
    );
    
    // タブが存在することを確認
    const scheduleTab = screen.getByText('スケジュール設定');
    const basicTab = screen.getByText('基本情報設定');
    expect(scheduleTab).toBeInTheDocument();
    expect(basicTab).toBeInTheDocument();

    // デフォルトはスケジュール設定（月曜などが見える）
    expect(screen.getByText('月')).toBeInTheDocument();

    // 基本情報設定タブをクリック
    fireEvent.click(basicTab);

    // 基本情報の列が表示されること
    expect(screen.getByText('フリガナ')).toBeInTheDocument();
    expect(screen.getByText('必須車両')).toBeInTheDocument();
  });
});
