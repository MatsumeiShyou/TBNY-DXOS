import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProjectRoot, normalizeRelativePath } from './paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const actualRoot = path.resolve(__dirname, '../../');

test('getProjectRoot: workspacePaths に無関係なパスが混ざっていても、AGENTS.mdがあるルートを見つける', () => {
  const payload = {
    workspacePaths: [
      'C:/fake/path/does/not/exist',
      actualRoot
    ]
  };
  const root = getProjectRoot(payload);
  assert.equal(root, actualRoot);
});

test('getProjectRoot: workspacePaths が空でも __dirname からフォールバックして解決する', () => {
  const payload = {};
  const root = getProjectRoot(payload);
  assert.equal(root, actualRoot);
});

test('getProjectRoot: どこにもマーカーがない場合は例外を投げる', () => {
  const payload = { workspacePaths: ['C:/fake/path'] };
  assert.throws(() => {
    getProjectRoot(payload, '/invalid/fallback/dir');
  }, /\[CRITICAL\]/);
});

test('normalizeRelativePath: パスを正規化してスラッシュ区切りの相対パスにする', () => {
  const target = path.join(actualRoot, 'apps\\repaper\\src\\index.ts');
  const rel = normalizeRelativePath(target, actualRoot);
  assert.equal(rel, 'apps/repaper/src/index.ts');
});
