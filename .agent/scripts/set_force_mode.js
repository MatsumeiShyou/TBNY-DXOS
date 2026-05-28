#!/usr/bin/env node

/**
 * set_force_mode.js
 * 
 * AGENTS.md §A群: FORCE_MODE（全体）および FORCE_RULE_xxx（個別）の
 * 値を変更するための唯一の公式手段。
 * 
 * .env の直接手動編集は禁止。このスクリプト経由でのみ変更可能。
 * すべての変更は AMPLOG.jsonl に自動記録される。
 * 
 * Usage:
 *   node .agent/scripts/set_force_mode.js --target=FORCE_MODE --value=off --reason="緊急復旧のため全規則を一時停止"
 *   node .agent/scripts/set_force_mode.js --target=FORCE_RULE_SVP --value=off --reason="SVPルールが誤検知を起こしているため一時無効化"
 *   node .agent/scripts/set_force_mode.js --show  (現在の設定一覧を表示)
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { getAllEffectiveModes, RULE_MAP } from './lib/force_mode_reader.js';

const PROJECT_ROOT = process.cwd();
const ENV_PATH = join(PROJECT_ROOT, '.env');
const AMPLOG_PATH = join(PROJECT_ROOT, 'AMPLOG.jsonl');

const VALID_TARGETS = ['FORCE_MODE', ...Object.values(RULE_MAP)];
const VALID_VALUES = ['error', 'off'];

const Log = {
  info: (msg) => console.log(`[SET_FORCE_MODE] ${msg}`),
  success: (msg) => console.log(`[SET_FORCE_MODE] ✓ ${msg}`),
  error: (msg) => console.error(`[SET_FORCE_MODE] ❌ ${msg}`),
};

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  
  for (const arg of args) {
    if (arg === '--show') {
      parsed.show = true;
      continue;
    }
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      parsed[match[1]] = match[2];
    }
  }
  return parsed;
}

function readEnvFile() {
  if (!existsSync(ENV_PATH)) return '';
  return readFileSync(ENV_PATH, 'utf-8');
}

function getCurrentValue(envContent, target) {
  const regex = new RegExp(`^${target}=(.*)$`, 'm');
  const match = envContent.match(regex);
  return match ? match[1].trim() : null;
}

function updateEnvFile(envContent, target, value) {
  const regex = new RegExp(`^${target}=.*$`, 'm');
  
  if (regex.test(envContent)) {
    // 既存の値を更新
    return envContent.replace(regex, `${target}=${value}`);
  } else {
    // 新規追加
    return envContent.trimEnd() + `\n${target}=${value}\n`;
  }
}

function recordToAmplog(target, previousValue, newValue, reason) {
  const record = {
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID(),
    type: 'FORCE_MODE_CHANGE',
    summary: `[GOVERNANCE] ${target}: ${previousValue || 'unset'} → ${newValue}`,
    detail: {
      target,
      previous_value: previousValue || 'unset',
      new_value: newValue,
      reason,
      operator: 'set_force_mode.js',
    },
  };

  appendFileSync(AMPLOG_PATH, JSON.stringify(record) + '\n');
  Log.info(`AMPLOG に記録しました: ${record.id}`);
}

function showCurrentModes() {
  Log.info('=== 現在の FORCE_MODE 設定一覧 ===');
  
  const envContent = readEnvFile();
  const globalMode = getCurrentValue(envContent, 'FORCE_MODE') || 'warning (default)';
  Log.info(`  FORCE_MODE (全体): ${globalMode}`);
  Log.info('');
  
  const effectiveModes = getAllEffectiveModes(PROJECT_ROOT);
  
  for (const [ruleName, envKey] of Object.entries(RULE_MAP)) {
    const individualSetting = getCurrentValue(envContent, envKey);
    const effective = effectiveModes[ruleName];
    const source = individualSetting ? `個別設定 (${individualSetting})` : `全体設定に従う`;
    Log.info(`  ${envKey}: 実効=${effective} [${source}]`);
  }
}

function main() {
  const args = parseArgs();

  if (args.show) {
    showCurrentModes();
    process.exit(0);
  }

  const { target, value, reason } = args;

  // バリデーション
  if (!target || !value || !reason) {
    Log.error('必須引数が不足しています。');
    Log.error('Usage: node .agent/scripts/set_force_mode.js --target=<TARGET> --value=<VALUE> --reason="<REASON>"');
    Log.error(`  有効な TARGET: ${VALID_TARGETS.join(', ')}`);
    Log.error(`  有効な VALUE: ${VALID_VALUES.join(', ')}`);
    process.exit(1);
  }

  if (!VALID_TARGETS.includes(target)) {
    Log.error(`無効な target: "${target}". 有効な値: ${VALID_TARGETS.join(', ')}`);
    process.exit(1);
  }

  if (!VALID_VALUES.includes(value.toLowerCase())) {
    Log.error(`無効な value: "${value}". 有効な値: ${VALID_VALUES.join(', ')}`);
    process.exit(1);
  }

  // .env の読み込みと更新
  let envContent = readEnvFile();
  const previousValue = getCurrentValue(envContent, target);

  if (previousValue === value.toLowerCase()) {
    Log.info(`${target} は既に "${value}" に設定されています。変更なし。`);
    process.exit(0);
  }

  envContent = updateEnvFile(envContent, target, value.toLowerCase());
  writeFileSync(ENV_PATH, envContent);
  Log.success(`.env を更新しました: ${target}=${value.toLowerCase()}`);

  // AMPLOG への記録
  recordToAmplog(target, previousValue, value.toLowerCase(), reason);

  // 変更後の状態を表示
  Log.info('');
  showCurrentModes();
}

main();
