/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { verifyPin, authenticate, setInitialPassword } from '../../services/gasApi';
import type { VerificationResult, AuthResponse } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Select from '../ui/Select';
import HelpTooltip from '../ui/HelpTooltip';
import PasswordPolicyValidator, { isPasswordPolicyMet } from '../ui/PasswordPolicyValidator';
import { LogIn, ArrowRight, ArrowLeft, UserCheck, Eye, EyeOff, KeyRound, ShieldQuestion } from 'lucide-react';

type LoginStep = 'pin' | 'driver' | 'password' | 'setPassword';

const LoginScreen: React.FC = () => {
  // --- States for standard multi-step login flow ---
  const [step, setStep] = useState<LoginStep>('pin');
  const [pin, setPin] = useState('');
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<{ name: string; hasSetPassword: boolean; } | null>(null);
  const [personalPassword, setPersonalPassword] = useState('');
  const [isPersonalPasswordVisible, setIsPersonalPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // --- States for simplified re-login flow ---
  const [reloginPassword, setReloginPassword] = useState('');
  const [isReloginPasswordVisible, setIsReloginPasswordVisible] = useState(false);
  
  // --- Common states ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, driverName, companyName, switchUser } = useWeighingAuth();

  // --- Handlers for Simplified Re-login Flow ---
  const handleRelogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName) return;
    
    setIsLoading(true);
    setError('');
    try {
      const result: AuthResponse = await authenticate(driverName, reloginPassword);
      // Fix: Use a guard clause for the failure case to ensure proper type narrowing.
      if (!result.success) {
        setError(result.message || 'パスワードが正しくありません。');
        return;
      }
      login(result.driverName, result.companyName || null, result.userType, result.settings);
    } catch (err) {
      setError('エラーが発生しました。時間をおいて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSwitchUser = () => {
    switchUser();
    // Also reset all local state for a clean slate
    setStep('pin');
    setPin('');
    setVerificationData(null);
    setSelectedDriver(null);
    setPersonalPassword('');
    setReloginPassword('');
    setError('');
  };

  // --- Handlers for Standard Login Flow ---
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await verifyPin(pin);
      // Fix: Use a guard clause for the failure case to ensure proper type narrowing.
      if (!result.success) {
        setError(result.message || '会社PINコードの検証に失敗しました。');
        return;
      }

      setVerificationData(result);
      if (result.drivers && result.drivers.length > 0) {
        setStep('driver');
        // Set initial selected driver
        const firstDriver = result.drivers[0];
        setSelectedDriver({ name: firstDriver.name, hasSetPassword: firstDriver.hasSetPassword ?? true });
      } else {
          setError('このPINに紐づくドライバーが見つかりませんでした。');
      }
    } catch (err) {
      setError('エラーが発生しました。時間をおいて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverSelect = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedDriver) {
      setStep(selectedDriver.hasSetPassword ? 'password' : 'setPassword');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setIsLoading(true);
    setError('');
    try {
      const result: AuthResponse = await authenticate(selectedDriver.name, personalPassword);
      // Fix: Use a guard clause for the failure case to ensure proper type narrowing.
      if (!result.success) {
        setError(result.message || 'ログインに失敗しました。');
        return;
      }
      login(result.driverName, result.companyName || null, result.userType, result.settings);
    } catch (err) {
      setError('エラーが発生しました。時間をおいて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }
    if (!isPasswordPolicyMet(newPassword)) {
      setError('パスワードが要件を満たしていません。');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
        const result: AuthResponse = await setInitialPassword(selectedDriver.name, newPassword);
        // Fix: Use a guard clause for the failure case to ensure proper type narrowing.
        if (!result.success) {
            setError(result.message || 'パスワードの設定に失敗しました。');
            return;
        }
        login(result.driverName, result.companyName || null, result.userType, result.settings);
    } catch (err) {
        setError('エラーが発生しました。時間をおいて再試行してください。');
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (step === 'driver' && verificationData?.success && verificationData?.drivers) {
        const currentDriver = verificationData.drivers.find(d => d.name === selectedDriver?.name);
        if (currentDriver) {
            setSelectedDriver({ name: currentDriver.name, hasSetPassword: currentDriver.hasSetPassword ?? true });
        }
    }
  }, [selectedDriver?.name, verificationData, step]);

  const canSubmitSetPassword = newPassword && confirmPassword && newPassword === confirmPassword && isPasswordPolicyMet(newPassword);

  // Re-login flow for returning users
  if (driverName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-sm">
          <div className="text-center mb-6">
            <UserCheck className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">おかえりなさい、<br/>{driverName}さん</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">{companyName || '個人のお客様'}</p>
          </div>
          
          <form onSubmit={handleRelogin}>
            <div className="space-y-4">
              <Input
                id="relogin-password"
                label="個人パスワード"
                type={isReloginPasswordVisible ? 'text' : 'password'}
                value={reloginPassword}
                onChange={(e) => setReloginPassword(e.target.value)}
                required
                endIcon={isReloginPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                onEndIconClick={() => setIsReloginPasswordVisible(!isReloginPasswordVisible)}
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={handleSwitchUser}>
                他のユーザーでログイン
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Standard login flow
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm">
        {step === 'pin' && (
          <div>
            <div className="text-center mb-6">
              <LogIn className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">会社PINコード入力</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2 flex items-center justify-center">
                会社用、またはお客様用のPINコードを入力してください
                <HelpTooltip title="会社PINコードとは？">
                  <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p>
                      管理者から共有された、協力会社または顧客ごとに割り当てられた共通の暗証番号（PIN）のことです。
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">ご不明な場合は、管理担当者にご確認ください。</p>
                    </div>
                  </div>
                </HelpTooltip>
              </p>
            </div>
            <form onSubmit={handlePinSubmit}>
              <div className="space-y-4">
                <Input
                  id="pin"
                  label="会社PINコード"
                  type={isPinVisible ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  endIcon={isPinVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setIsPinVisible(!isPinVisible)}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" fullWidth disabled={isLoading || !pin}>
                  {isLoading ? '確認中...' : '次へ'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}
        {step === 'driver' && verificationData?.success && (
          <div>
            <div className="text-center mb-6">
              <UserCheck className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                {verificationData?.company?.name || verificationData?.customerName || ''} 様
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2">ようこそ。ログインする担当者を選択してください。</p>
            </div>
            <form onSubmit={handleDriverSelect}>
              <div className="space-y-4">
                <Select
                  id="driver"
                  label="ドライバー名"
                  value={selectedDriver?.name || ''}
                  onChange={(e) => {
                    const driver = verificationData?.drivers?.find(d => d.name === e.target.value);
                    if (driver) setSelectedDriver({name: driver.name, hasSetPassword: driver.hasSetPassword ?? true});
                  }}
                  required
                >
                  {verificationData?.drivers?.map((driver) => (
                    <option key={driver.id} value={driver.name}>
                      {driver.name}
                    </option>
                  ))}
                </Select>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-between items-center mt-6">
                  <Button type="button" variant="secondary" onClick={() => { setStep('pin'); setError(''); setPin(''); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    次へ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
        {step === 'password' && (
          <div>
            <div className="text-center mb-6">
              <KeyRound className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                こんにちは、<br/>{selectedDriver?.name}さん
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2">個人パスワードを入力してください。</p>
            </div>
            <form onSubmit={handlePasswordLogin}>
              <div className="space-y-4">
                <Input
                  id="personal-password"
                  label="個人パスワード"
                  type={isPersonalPasswordVisible ? 'text' : 'password'}
                  value={personalPassword}
                  onChange={(e) => setPersonalPassword(e.target.value)}
                  required
                  endIcon={isPersonalPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setIsPersonalPasswordVisible(!isPersonalPasswordVisible)}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-between items-center mt-6">
                  <Button type="button" variant="secondary" onClick={() => { setStep('driver'); setError(''); setPersonalPassword(''); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                  <Button type="submit" disabled={isLoading || !personalPassword}>
                    {isLoading ? 'ログイン中...' : 'ログイン'}
                    {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
        {step === 'setPassword' && (
          <div>
            <div className="text-center mb-6">
              <ShieldQuestion className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                ようこそ、<br/>{selectedDriver?.name}さん
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-2">初回ログインのため、パスワードを設定してください。</p>
            </div>
            <form onSubmit={handleSetPassword}>
              <div className="space-y-4">
                <Input
                  id="new-password"
                  label="新しいパスワード"
                  type={isNewPasswordVisible ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  endIcon={isNewPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                />
                <Input
                  id="confirm-password"
                  label="新しいパスワード（確認用）"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  endIcon={isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  onEndIconClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                />
                <PasswordPolicyValidator password={newPassword} />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-between items-center mt-6">
                  <Button type="button" variant="secondary" onClick={() => { setStep('driver'); setError(''); setNewPassword(''); setConfirmPassword(''); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                  <Button type="submit" disabled={isLoading || !canSubmitSetPassword}>
                    {isLoading ? '設定中...' : '設定してログイン'}
                    {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginScreen;
