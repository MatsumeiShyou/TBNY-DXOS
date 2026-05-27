#!/usr/bin/env node

/**
 * force_mode_reader.js
 * 
 * AGENTS.md §A群: FORCE_MODE（全体）と FORCE_RULE_xxx（個別）の
 * 優先順位を解決し、各規則の実効モードを返すユーティリティ。
 * 
 * 優先順位:
 *   1. FORCE_MODE=off → 個別設定に関わらず全規則を無効化
 *   2. FORCE_RULE_xxx が設定されている → その値を使用
 *   3. FORCE_RULE_xxx が未設定 → FORCE_MODE の値を使用
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 有効な規則名と対応する環境変数名のマッピング
const RULE_MAP = {
  FSOOT:    'FORCE_RULE_FSOOT',
  LEAKAGE:  'FORCE_RULE_LEAKAGE',
  SDR:      'FORCE_RULE_SDR',
  TIER:     'FORCE_RULE_TIER',
  PURGE:    'FORCE_RULE_PURGE',
  BOUNDARY: 'FORCE_RULE_BOUNDARY',
  SVP:      'FORCE_RULE_SVP',
};

const VALID_MODES = ['error', 'warning', 'off'];

/**
 * .env ファイルから環境変数を読み込む（dotenv 非依存）
 */
function loadEnvFile(projectRoot) {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) return {};

  const envVars = {};
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    envVars[key] = value;
  }
  return envVars;
}

/**
 * 指定された規則の実効モードを返す
 * @param {string} ruleName - 規則名（例: 'FSOOT', 'SVP'）
 * @param {string} [projectRoot] - プロジェクトルート（省略時は cwd）
 * @returns {'error' | 'warning' | 'off'} 実効モード
 */
export function getEffectiveMode(ruleName, projectRoot = process.cwd()) {
  const envVars = loadEnvFile(projectRoot);

  // 1. FORCE_MODE（全体）を取得
  const globalMode = (process.env.FORCE_MODE || envVars.FORCE_MODE || 'warning').toLowerCase();

  // FORCE_MODE=off → 全規則無効
  if (globalMode === 'off') return 'off';

  // 2. FORCE_RULE_xxx（個別）を取得
  const envKey = RULE_MAP[ruleName];
  if (!envKey) {
    console.warn(`[FORCE_MODE_READER] Unknown rule name: ${ruleName}. Falling back to global mode.`);
    return VALID_MODES.includes(globalMode) ? globalMode : 'warning';
  }

  const ruleMode = (process.env[envKey] || envVars[envKey] || '').toLowerCase();

  // 3. 個別設定があればそれを使用、なければ全体設定を使用
  if (ruleMode && VALID_MODES.includes(ruleMode)) {
    return ruleMode;
  }

  return VALID_MODES.includes(globalMode) ? globalMode : 'warning';
}

/**
 * 全規則の実効モード一覧を返す
 * @param {string} [projectRoot] - プロジェクトルート（省略時は cwd）
 * @returns {Object} 各規則名をキー、実効モードを値とするオブジェクト
 */
export function getAllEffectiveModes(projectRoot = process.cwd()) {
  const result = {};
  for (const ruleName of Object.keys(RULE_MAP)) {
    result[ruleName] = getEffectiveMode(ruleName, projectRoot);
  }
  return result;
}

/**
 * 指定された規則が強制停止（error）かどうかを返す
 */
export function isEnforced(ruleName, projectRoot = process.cwd()) {
  return getEffectiveMode(ruleName, projectRoot) === 'error';
}

/**
 * 指定された規則が警告（warning）かどうかを返す
 */
export function isWarning(ruleName, projectRoot = process.cwd()) {
  return getEffectiveMode(ruleName, projectRoot) === 'warning';
}

/**
 * 指定された規則が無効（off）かどうかを返す
 */
export function isDisabled(ruleName, projectRoot = process.cwd()) {
  return getEffectiveMode(ruleName, projectRoot) === 'off';
}

// エクスポート: 規則名一覧
export { RULE_MAP };
