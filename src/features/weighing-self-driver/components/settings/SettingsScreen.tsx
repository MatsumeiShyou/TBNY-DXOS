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
            <main className="container mx-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <h3 className="text-lg font-bold mb-4">表示設定</h3>
                        <div className="space-y-6">
                            {/* Theme Settings */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">テーマ</label>
                                <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                                    {themeOptions.map(option => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setTheme(option.value)}
                                                className={`w-full flex items-center justify-center space-x-2 text-center font-bold py-2 rounded-md transition-colors ${
                                                    theme === option.value 
                                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow' 
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">フォントサイズ</label>
                                <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                                    {fontOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFontSize(option.value)}
                                            className={`w-full text-center font-bold py-2 rounded-md transition-colors ${
                                                fontSize === option.value 
                                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow' 
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Pulse Effect Setting */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
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
                        <h3 className="text-lg font-bold mb-4">セキュリティ設定</h3>
                        <div className="space-y-4">
                            <Button onClick={() => setIsPasswordModalOpen(true)} fullWidth variant="secondary">
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                パスワードを変更する
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold mb-4">情報</h3>
                        <div className="space-y-4">
                            <Button onClick={() => setIsHelpModalOpen(true)} fullWidth variant="secondary">
                                <Info className="mr-2 h-5 w-5" />
                                使い方・お問い合わせ
                            </Button>
                            <div className="flex justify-between items-center text-left p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">アプリバージョン</span>
                                <span className="text-slate-600 dark:text-slate-300">{appVersion}</span>
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
                <div className="space-y-4">
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
                    {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
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
                <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">基本的な使い方</h4>
                        <p>このアプリは、計量記録を簡単に行うためのツールです。</p>
                        <ul className="mt-4 space-y-4">
                           <li className="flex items-start">
                               <GaugeCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                               <div>
                                   <strong className="text-slate-800 dark:text-slate-200">計量記録:</strong> 画面下の「計量記録」から、ステップに従って新しい記録を作成します。
                               </div>
                           </li>
                           <li className="flex items-start">
                               <History className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                               <div>
                                   <strong className="text-slate-800 dark:text-slate-200">履歴:</strong> 過去の記録を「履歴」から確認・編集できます。（記録後24時間以内）
                               </div>
                           </li>
                           <li className="flex items-start">
                               <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                               <div>
                                   <strong className="text-slate-800 dark:text-slate-200">新規作成:</strong> 画面右下の「+」ボタンから、現在の入力を破棄して新しい記録を開始します。
                               </div>
                           </li>
                           <li className="flex items-start">
                               <WifiOff className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                               <div>
                                   <strong className="text-slate-800 dark:text-slate-200">オフライン:</strong> 電波のない場所でも記録は可能です。オンラインになった際に自動で送信されます。
                               </div>
                           </li>
                        </ul>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">お問い合わせ</h4>
                        <p>問題が発生した場合や、ご不明な点がある場合は、管理担当者までご連絡ください。</p>
                        <div className="mt-4 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 flex items-start">
                           <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0" />
                           <div className="text-slate-800 dark:text-slate-200">
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
