/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useToast } from '../../contexts/ToastContext';
import { changePassword } from '../../services/gasApi';
import type { FontSize, Theme, AuthResponse } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ToggleSwitch from '../ui/ToggleSwitch';
import Input from '../ui/Input';
import PasswordPolicyValidator, { isPasswordPolicyMet } from '../ui/PasswordPolicyValidator';
import { Info, Sun, Moon, Laptop, ShieldCheck, Eye, EyeOff, GaugeCircle, History, Plus, WifiOff, Phone } from 'lucide-react';

const SettingsScreen: React.FC = () => {
    const { fontSize, setFontSize, theme, setTheme, isPulseEffectEnabled, setIsPulseEffectEnabled } = useSettings();
    const { driverName } = useWeighingAuth();
    const { addToast } = useToast();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isCurrentVisible, setIsCurrentVisible] = useState(false);
    const [isNewVisible, setIsNewVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const appVersion = "1.2.0"; // Version updated for new feature

    const handlePasswordChange = async () => {
        if (!driverName) return;
        
        if (newPassword !== confirmPassword) {
            setPasswordError('新しいパスワードが一致しません。');
            return;
        }
        if (!isPasswordPolicyMet(newPassword)) {
            setPasswordError('パスワードが要件を満たしていません。');
            return;
        }

        setIsLoading(true);
        setPasswordError('');
        try {
            const result: AuthResponse = await changePassword(driverName, currentPassword, newPassword);
            // Fix: Use a guard clause for the failure case to ensure proper type narrowing.
            if (!result.success) {
                setPasswordError(result.message || 'エラーが発生しました。');
                return;
            }
            addToast('パスワードを変更しました。', 'success');
            setIsPasswordModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError('エラーが発生しました。時間をおいて再試行してください。');
        } finally {
            setIsLoading(false);
        }
    };

    const fontOptions: { value: FontSize; label: string }[] = [
        { value: 'sm', label: '小' },
        { value: 'md', label: '中' },
        { value: 'lg', label: '大' },
    ];
    
    const themeOptions: { value: Theme; label: string; icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }> }[] = [
        { value: 'light', label: 'ライト', icon: Sun },
        { value: 'dark', label: 'ダーク', icon: Moon },
        { value: 'system', label: 'システム', icon: Laptop },
    ];
    
    const canSubmitPassword = newPassword && confirmPassword && currentPassword && isPasswordPolicyMet(newPassword) && newPassword === confirmPassword;

    return (
        <>
            <main className="tw-container tw-mx-auto tw-p-4 md:p-6">
                <div className="tw-max-w-4xl tw-mx-auto tw-space-y-8">
                    <Card>
                        <h3 className="tw-text-lg tw-font-bold tw-mb-4">表示設定</h3>
                        <div className="tw-space-y-6">
                            {/* Theme Settings */}
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-2">テーマ</label>
                                <div className="tw-flex tw-bg-slate-200 dark:bg-slate-700 tw-rounded-lg tw-p-1">
                                    {themeOptions.map(option => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setTheme(option.value)}
                                                className={`tw-w-full tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-text-center tw-font-bold tw-py-2 tw-rounded-md tw-transition-colors ${
                                                    theme === option.value 
                                                    ? 'tw-bg-white dark:bg-slate-900 tw-text-blue-600 dark:text-blue-400 tw-shadow' 
                                                    : 'tw-text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <Icon size={16} />
                                                <span>{option.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Font Size Settings */}
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-2">フォントサイズ</label>
                                <div className="tw-flex tw-bg-slate-200 dark:bg-slate-700 tw-rounded-lg tw-p-1">
                                    {fontOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFontSize(option.value)}
                                            className={`tw-w-full tw-text-center tw-font-bold tw-py-2 tw-rounded-md tw-transition-colors ${
                                                fontSize === option.value 
                                                ? 'tw-bg-white dark:bg-slate-900 tw-text-blue-600 dark:text-blue-400 tw-shadow' 
                                                : 'tw-text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Pulse Effect Setting */}
                            <div className="tw-border-t tw-border-slate-200 dark:border-slate-700 tw-pt-6">
                                <ToggleSwitch
                                    id="pulse-effect-toggle"
                                    label="ナビゲーションヒント"
                                    description="次に押すボタンを脈動エフェクトで強調表示します。"
                                    checked={isPulseEffectEnabled}
                                    onChange={setIsPulseEffectEnabled}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="tw-text-lg tw-font-bold tw-mb-4">セキュリティ設定</h3>
                        <div className="tw-space-y-4">
                            <Button onClick={() => setIsPasswordModalOpen(true)} fullWidth variant="secondary">
                                <ShieldCheck className="tw-mr-2 tw-h-5 tw-w-5" />
                                パスワードを変更する
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="tw-text-lg tw-font-bold tw-mb-4">情報</h3>
                        <div className="tw-space-y-4">
                            <Button onClick={() => setIsHelpModalOpen(true)} fullWidth variant="secondary">
                                <Info className="tw-mr-2 tw-h-5 tw-w-5" />
                                使い方・お問い合わせ
                            </Button>
                            <div className="tw-flex tw-justify-between tw-items-center tw-text-left tw-p-4 tw-bg-slate-50 dark:bg-slate-700/50 tw-rounded-lg">
                                <span className="tw-font-semibold tw-text-slate-800 dark:text-slate-200">アプリバージョン</span>
                                <span className="tw-text-slate-600 dark:text-slate-300">{appVersion}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="パスワードの変更"
            >
                <div className="tw-space-y-4">
                    <Input
                        id="current-password"
                        label="現在のパスワード"
                        type={isCurrentVisible ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        endIcon={isCurrentVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        onEndIconClick={() => setIsCurrentVisible(!isCurrentVisible)}
                    />
                    <Input
                        id="new-password"
                        label="新しいパスワード"
                        type={isNewVisible ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        endIcon={isNewVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        onEndIconClick={() => setIsNewVisible(!isNewVisible)}
                    />
                    <Input
                        id="confirm-password"
                        label="新しいパスワード（確認用）"
                        type={isConfirmVisible ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        endIcon={isConfirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        onEndIconClick={() => setIsConfirmVisible(!isConfirmVisible)}
                    />
                    <PasswordPolicyValidator password={newPassword} />
                    {passwordError && <p className="tw-text-red-500 tw-text-sm tw-text-center">{passwordError}</p>}
                </div>
                <div className="tw-flex tw-justify-end tw-space-x-2 tw-mt-6">
                    <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>キャンセル</Button>
                    <Button onClick={handlePasswordChange} disabled={!canSubmitPassword || isLoading}>
                        {isLoading ? '変更中...' : '変更する'}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="ヘルプ"
            >
                <div className="tw-space-y-6 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
                    <div>
                        <h4 className="tw-font-bold tw-text-lg tw-text-slate-800 dark:text-slate-200 tw-mb-2">基本的な使い方</h4>
                        <p>このアプリは、計量記録を簡単に行うためのツールです。</p>
                        <ul className="tw-mt-4 tw-space-y-4">
                           <li className="tw-flex tw-items-start">
                               <GaugeCircle className="tw-h-6 tw-w-6 tw-text-blue-600 dark:text-blue-400 tw-mr-3 tw-mt-1 tw-flex-shrink-0" />
                               <div>
                                   <strong className="tw-text-slate-800 dark:text-slate-200">計量記録:</strong> 画面下の「計量記録」から、ステップに従って新しい記録を作成します。
                               </div>
                           </li>
                           <li className="tw-flex tw-items-start">
                               <History className="tw-h-6 tw-w-6 tw-text-blue-600 dark:text-blue-400 tw-mr-3 tw-mt-1 tw-flex-shrink-0" />
                               <div>
                                   <strong className="tw-text-slate-800 dark:text-slate-200">履歴:</strong> 過去の記録を「履歴」から確認・編集できます。（記録後24時間以内）
                               </div>
                           </li>
                           <li className="tw-flex tw-items-start">
                               <Plus className="tw-h-6 tw-w-6 tw-text-blue-600 dark:text-blue-400 tw-mr-3 tw-mt-1 tw-flex-shrink-0" />
                               <div>
                                   <strong className="tw-text-slate-800 dark:text-slate-200">新規作成:</strong> 画面右下の「+」ボタンから、現在の入力を破棄して新しい記録を開始します。
                               </div>
                           </li>
                           <li className="tw-flex tw-items-start">
                               <WifiOff className="tw-h-6 tw-w-6 tw-text-blue-600 dark:text-blue-400 tw-mr-3 tw-mt-1 tw-flex-shrink-0" />
                               <div>
                                   <strong className="tw-text-slate-800 dark:text-slate-200">オフライン:</strong> 電波のない場所でも記録は可能です。オンラインになった際に自動で送信されます。
                               </div>
                           </li>
                        </ul>
                    </div>
                    <div className="tw-border-t tw-border-slate-200 dark:border-slate-700 tw-pt-6">
                        <h4 className="tw-font-bold tw-text-lg tw-text-slate-800 dark:text-slate-200 tw-mb-2">お問い合わせ</h4>
                        <p>問題が発生した場合や、ご不明な点がある場合は、管理担当者までご連絡ください。</p>
                        <div className="tw-mt-4 tw-bg-slate-100 dark:bg-slate-700 tw-p-4 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600 tw-flex tw-items-start">
                           <Phone className="tw-h-6 tw-w-6 tw-text-blue-600 dark:text-blue-400 tw-mr-4 tw-flex-shrink-0" />
                           <div className="tw-text-slate-800 dark:text-slate-200">
                               <p><strong>担当:</strong> 鈴木</p>
                               <p><strong>連絡先:</strong> xxx-xxxx-xxxx</p>
                           </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SettingsScreen;
