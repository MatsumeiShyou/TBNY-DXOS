/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordPolicyValidatorProps {
  password?: string;
}

interface PolicyRule {
  id: string;
  label: string;
  regex: RegExp;
}

const policyRules: PolicyRule[] = [
  { id: 'length', label: '6文字以上', regex: /^.{6,}$/ },
  { id: 'case', label: '英大文字・小文字を含む', regex: /^(?=.*[a-z])(?=.*[A-Z]).*$/ },
  { id: 'number', label: '数字を含む', regex: /^(?=.*\d).*$/ },
  { id: 'symbol', label: '記号を含む', regex: /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/ },
];

const PasswordPolicyValidator: React.FC<PasswordPolicyValidatorProps> = ({ password = '' }) => {
  const validationResults = useMemo(() => {
    return policyRules.map(rule => ({
      ...rule,
      isValid: rule.regex.test(password),
    }));
  }, [password]);

  return (

    <div className="tw-p-4 tw-bg-slate-50 dark:bg-slate-700/50 tw-border tw-border-slate-200 dark:border-slate-600 tw-rounded-lg">
      <ul className="tw-space-y-2">
        {validationResults.map(({ id, label, isValid }) => (
          <li key={id} className={`tw-flex tw-items-center tw-text-sm ${isValid ? 'tw-text-green-600 dark:text-green-400' : 'tw-text-slate-500 dark:text-slate-300'}`}>
            {isValid ? (
              <CheckCircle size={16} className="tw-mr-2 tw-flex-shrink-0" />
            ) : (
              <XCircle size={16} className="tw-mr-2 tw-flex-shrink-0" />
            )}
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const isPasswordPolicyMet = (password: string): boolean => {
    return policyRules.every(rule => rule.regex.test(password));
}

export default PasswordPolicyValidator;