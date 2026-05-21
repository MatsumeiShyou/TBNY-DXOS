import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserAccount, Company, Customer } from '../../types';
import { getUserAccounts, updateUserAccountStatus, resetUserPassword, companyApi, customerApi } from '../../services/api';
import { useAppContext } from '../../hooks/useAppContext';
import { useToast } from '../../hooks/useToast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import AlertDialog from '../ui/AlertDialog';
import { UserPlus, Search, KeyRound, Users } from 'lucide-react';

// A simple, self-contained ToggleSwitch component for this screen
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={handleClick}
            disabled={disabled}
            className={`tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors tw-duration-200 tw-ease-in-out focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-interactive-default focus:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50 ${checked ? 'tw-bg-interactive-default' : 'tw-bg-gray-300 dark:tw-bg-gray-600'}`}
        >
            <span
                aria-hidden="true"
                className={`tw-pointer-events-none tw-inline-block tw-h-5 tw-w-5 tw-transform tw-rounded-full tw-bg-white tw-shadow tw-ring-0 tw-transition tw-duration-200 tw-ease-in-out ${checked ? 'tw-translate-x-5' : 'tw-translate-x-0'}`}
            />
        </button>
    );
};


const UsersScreen: React.FC = () => {
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionUser, setActionUser] = useState<UserAccount | null>(null);
    const [dialogType, setDialogType] = useState<'status' | 'password' | null>(null);

    const { withStatusHandling, isLoading } = useAppContext();
    const { showToast } = useToast();

    const affiliationMap = useMemo(() => {
        const map = new Map<string, string>();
        companies.forEach(c => map.set(c.id, c.name));
        customers.forEach(c => map.set(c.id, `[顧客] ${c.name}`));
        return map;
    }, [companies, customers]);

    const fetchData = useCallback(() => {
        withStatusHandling(async () => {
            const [usersData, companiesData, customersData] = await Promise.all([
                getUserAccounts(),
                companyApi.get(),
                customerApi.get(),
            ]).catch(err => {
                console.error('Failed to fetch users or companies/customers', err);
                return [[], [], []] as [UserAccount[], Company[], Customer[]];
            });
            setUsers(usersData);
            setCompanies(companiesData);
            setCustomers(customersData);
        });
    }, [withStatusHandling]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => {
            const affiliation = user.companyId ? affiliationMap.get(user.companyId) : affiliationMap.get(user.customerId || '');
            return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (affiliation && affiliation.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [users, searchTerm, affiliationMap]);
    
    const handleStatusChange = async (user: UserAccount, newStatus: boolean) => {
        const status = newStatus ? 'ACTIVE' : 'INACTIVE';
        try {
            await updateUserAccountStatus(user.id, status);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, accountStatus: status } : u));
            showToast(`${user.name}のアカウントを${newStatus ? '有効' : '無効'}にしました。`);
        } catch (error) {
            showToast('アカウント状態の更新に失敗しました。', 'error');
            console.error(error);
        }
    };

    const handlePasswordReset = async () => {
        if (!actionUser) return;
        try {
            await resetUserPassword(actionUser.id);
            setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, passwordStatus: 'PENDING' } : u));
            showToast(`${actionUser.name}のパスワードをリセットしました。`);
        } catch (error) {
            showToast('パスワードのリセットに失敗しました。', 'error');
            console.error(error);
        } finally {
            setActionUser(null);
            setDialogType(null);
        }
    };
    
    const openDialog = (user: UserAccount, type: 'status' | 'password') => {
        setActionUser(user);
        setDialogType(type);
    };
    
    const closeDialog = () => {
        setActionUser(null);
        setDialogType(null);
    };


    const isInitialLoading = users.length === 0 && companies.length === 0 && isLoading;

    return (
      <>
        <div className="tw-space-y-6">
            <div className="tw-flex tw-justify-between tw-items-start">
                <div>
                    <h1 className="tw-text-3xl tw-font-bold">ユーザー管理</h1>
                    <p className="tw-text-text-secondary tw-mt-1">ドライバーアカウントの招待、状態管理、パスワードリセットを行います。</p>
                </div>
                <Button icon={<UserPlus className="tw-w-4 tw-h-4" />}>新規ドライバーを招待</Button>
            </div>
            
            <div className="tw-relative">
              <input type="text" placeholder="氏名、所属で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="tw-w-full tw-h-10 tw-pl-10 tw-pr-4 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors" />
              <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-text-text-secondary" />
            </div>

            <Card className="tw-p-0 tw-overflow-hidden">
                 <div className="tw-overflow-x-auto">
                    <table className="tw-w-full tw-text-sm">
                        <thead className="tw-bg-background-tertiary">
                            <tr>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">氏名</th>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">所属</th>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">パスワード</th>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">アカウント状態</th>
                                <th className="tw-p-3 tw-text-center tw-font-semibold tw-text-text-secondary">アクション</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isInitialLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="tw-border-t tw-border-border-default">
                                        <td className="tw-p-3"><Skeleton className="tw-h-4 tw-w-24" /></td>
                                        <td className="tw-p-3"><Skeleton className="tw-h-4 tw-w-32" /></td>
                                        <td className="tw-p-3"><Skeleton className="tw-h-5 tw-w-20" /></td>
                                        <td className="tw-p-3"><Skeleton className="tw-h-6 tw-w-11" /></td>
                                        <td className="tw-p-3 tw-flex tw-justify-center"><Skeleton className="tw-h-8 tw-w-32" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="tw-text-center tw-p-16 tw-text-text-secondary">
                                        {searchTerm ? (
                                            <>
                                                <Search className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-400" />
                                                <p className="tw-mt-4 tw-font-semibold">検索結果がありません</p>
                                                <p className="tw-text-sm">「{searchTerm}」に一致するユーザーは見つかりませんでした。</p>
                                            </>
                                        ) : (
                                            <>
                                                <Users className="tw-mx-auto tw-w-12 tw-h-12 tw-text-gray-400" />
                                                <p className="tw-mt-4 tw-font-semibold">ユーザーが登録されていません</p>
                                                <p className="tw-text-sm">「新規ドライバーを招待」からユーザーを追加してください。</p>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const affiliation = user.companyId ? affiliationMap.get(user.companyId) : (user.customerId ? affiliationMap.get(user.customerId) : '未所属');
                                    return (
                                        <tr key={user.id} className="tw-border-t tw-border-border-default">
                                            <td className="tw-p-3 tw-font-semibold tw-text-text-primary">{user.name}</td>
                                            <td className="tw-p-3 tw-text-text-secondary">{affiliation}</td>
                                            <td className="tw-p-3">
                                                {user.passwordStatus === 'SET' ? (
                                                    <span className="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full tw-bg-green-100 tw-text-green-800 dark:tw-bg-green-900 dark:tw-text-green-200">設定済</span>
                                                ) : (
                                                    <span className="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full tw-bg-yellow-100 tw-text-yellow-800 dark:tw-bg-yellow-900 dark:tw-text-yellow-200">初回設定待ち</span>
                                                )}
                                            </td>
                                            <td className="tw-p-3">
                                                <ToggleSwitch checked={user.accountStatus === 'ACTIVE'} onChange={() => handleStatusChange(user, user.accountStatus !== 'ACTIVE')} />
                                            </td>
                                            <td className="tw-p-3 tw-text-center">
                                                <Button variant="outline" size="sm" icon={<KeyRound className="tw-w-4 tw-h-4" />} onClick={() => openDialog(user, 'password')}>
                                                    パスワードをリセット
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                 </div>
            </Card>
        </div>
        {actionUser && dialogType === 'password' && (
            <AlertDialog
                isOpen={true}
                onClose={closeDialog}
                onConfirm={handlePasswordReset}
                title="パスワードリセットの確認"
                description={`ドライバー「${actionUser.name}」のパスワードをリセットしますか？実行後、ドライバーは次回ログイン時に新しいパスワードを設定する必要があります。`}
                confirmText="リセット"
            />
        )}
      </>
    );
};

export default UsersScreen;
