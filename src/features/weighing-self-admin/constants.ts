import type { ViewName } from './types';
import { LayoutDashboard, List, Database, Users, Settings } from 'lucide-react';
import type { ElementType } from 'react';

export const NAV_ITEMS: { view: ViewName; label: string; icon: ElementType }[] = [
  { view: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { view: 'records', label: '計量記録', icon: List },
  { view: 'masters', label: 'マスタ管理', icon: Database },
  { view: 'users', label: 'ユーザー管理', icon: Users },
  { view: 'settings', label: '設定', icon: Settings },
];
