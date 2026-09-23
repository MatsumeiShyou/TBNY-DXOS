import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Job, Customer, Driver } from '../types';
import { buildPrintableData } from '../utils/printUtils';
import type { PrintableGroup, PrintableBlock } from '../utils/printUtils';

interface PrintableDispatchSheetProps {
  driverId: string | null;
  drivers: Driver[];
  jobs: Job[];
  customers: Customer[];
  onCancel?: () => void;
}

/* =========================================================================
 * CSS定数 (インラインスタイルで一貫性を確保)
 * ========================================================================= */
const COLORS = {
  border: '#0056b3',       // 全体枠の青色
  borderInner: '#333',     // テーブル内部の罫線色
  headerNotice: '#00a2e8', // 水色（受領書注意枠）
  bgGray: '#f5f5f5',      // ヘッダー行背景
  bgGrayLight: '#fafafa',  // 厚木事業所行背景
  text: '#111',
} as const;

/* =========================================================================
 * ブロックテーブルのレンダリング
 * ========================================================================= */

/** 区分ブロック1つ分のテーブルを生成 */
function renderGroupTable(
  group: PrintableGroup,
  groupIndex: number,
): React.ReactNode {
  // rowspanの合計を計算: 厚木事業所=1行、案件=rowCount行
  const groupRowSpan = group.blocks.reduce(
    (acc, b) => acc + (b.isAtsugi ? 1 : b.rowCount),
    0,
  );

  const rows: React.ReactNode[] = [];
  let isFirstRowInGroup = true;

  group.blocks.forEach((block, blockIndex) => {
    const isStartAtsugi = block.isAtsugi && block.id.includes('start');
    const isEndAtsugi = block.isAtsugi && block.id.includes('end');

    // --- 厚木事業所行 ---
    if (block.isAtsugi) {
      rows.push(
        <tr key={block.id} style={{ backgroundColor: COLORS.bgGrayLight }}>
          {/* 区分列: グループ内の最初の行にだけ出力 */}
          {isFirstRowInGroup && (
            <td
              rowSpan={groupRowSpan}
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textAlign: 'center',
                verticalAlign: 'middle',
                border: `1px solid ${COLORS.borderInner}`,
                backgroundColor: COLORS.bgGray,
                padding: '4px 2px',
              }}
            >
              {group.period}
            </td>
          )}
          {/* 管理 (空) */}
          <td style={{ ...cellBase, borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}></td>
          {/* 回収先 */}
          <td style={{ ...cellBase, fontWeight: 'bold', borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}>
            {isEndAtsugi ? '厚木事業所に到着（帰庫）' : '厚木事業所'}
          </td>
          {/* 住所・その他 (空) */}
          <td style={{ ...cellBase, borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}></td>
          {/* 順番 (空) */}
          <td style={{ ...cellBase, borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}></td>
          {/* 時間 */}
          <td style={{ ...cellBase, textAlign: 'left', borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}>
            {isStartAtsugi ? '出発 :' : '到着 :'}
          </td>
          {/* 品目 */}
          <td style={{ ...cellBase, textAlign: 'left', fontWeight: 'bold', borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}>
            {isStartAtsugi ? '総重量→' : ''}
          </td>
          {/* 概算重量 */}
          <td style={{ ...cellBase, borderTop: `1px dashed ${COLORS.borderInner}`, borderBottom: `1px dashed ${COLORS.borderInner}` }}>
            {isStartAtsugi ? '' : ''}
          </td>
          {/* 入力重量: 起点は太枠空欄 */}
          <td style={{
            ...cellBase,
            borderTop: `1px dashed ${COLORS.borderInner}`,
            borderBottom: `1px dashed ${COLORS.borderInner}`,
            ...(isStartAtsugi ? { border: `2px solid ${COLORS.borderInner}` } : {}),
          }}>
            {isStartAtsugi ? '' : ''}
          </td>
        </tr>,
      );
      if (isFirstRowInGroup) isFirstRowInGroup = false;
      return;
    }

    // --- 通常案件行 (1案件=rowCount行, 最低3行) ---
    let managerStr = block.manager || '';
    if (managerStr.trim() === block.customerName?.trim()) {
      managerStr = ''; // 管理列の重複非表示
    }

    for (let r = 0; r < block.rowCount; r++) {
      const isFirstRow = r === 0;
      const item = block.items?.[r];

      let timeLabel = '';
      if (r === 0) timeLabel = '到着 :';
      else if (r === 1) timeLabel = '出発 :';
      // 3行目以降は空欄

      const rowBorderBottom =
        r < block.rowCount - 1
          ? `1px dotted #999` // 案件内の行間は薄い点線
          : `1px solid ${COLORS.borderInner}`; // 案件の最終行は実線

      rows.push(
        <tr key={`${block.id}-${r}`}>
          {/* 区分列 */}
          {isFirstRowInGroup && isFirstRow && (
            <td
              rowSpan={groupRowSpan}
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textAlign: 'center',
                verticalAlign: 'middle',
                border: `1px solid ${COLORS.borderInner}`,
                backgroundColor: COLORS.bgGray,
                padding: '4px 2px',
              }}
            >
              {group.period}
            </td>
          )}

          {/* 管理 (rowspan) */}
          {isFirstRow && (
            <td
              rowSpan={block.rowCount}
              style={{
                ...cellBase,
                verticalAlign: 'top',
                textAlign: 'left',
                fontSize: '9px',
                borderTop: `1px solid ${COLORS.borderInner}`,
              }}
            >
              {managerStr}
            </td>
          )}
          {/* 回収先 (rowspan) */}
          {isFirstRow && (
            <td
              rowSpan={block.rowCount}
              style={{
                ...cellBase,
                verticalAlign: 'top',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '10px',
                borderTop: `1px solid ${COLORS.borderInner}`,
              }}
            >
              {block.customerName}
              {block.schedule && (
                <span style={{ fontSize: '8px', fontWeight: 'normal', marginLeft: '2px', color: '#666' }}>
                  {block.schedule}
                </span>
              )}
            </td>
          )}
          {/* 住所・その他 (rowspan) */}
          {isFirstRow && (
            <td
              rowSpan={block.rowCount}
              style={{
                ...cellBase,
                verticalAlign: 'top',
                textAlign: 'left',
                fontSize: '9px',
                borderTop: `1px solid ${COLORS.borderInner}`,
              }}
            >
              {block.address}
              {block.notes && block.notes.filter(Boolean).length > 0 && (
                <div style={{ marginTop: '2px' }}>
                  {block.notes.filter(Boolean).map((note, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        border: '1.5px solid #dc2626',
                        color: '#dc2626',
                        fontWeight: 'bold',
                        padding: '0 2px',
                        borderRadius: '2px',
                        fontSize: '7px',
                        lineHeight: '1.2',
                        marginRight: '2px',
                        marginBottom: '1px',
                      }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              )}
            </td>
          )}
          {/* 順番 (rowspan, 手書き空欄) */}
          {isFirstRow && (
            <td
              rowSpan={block.rowCount}
              style={{
                ...cellBase,
                verticalAlign: 'top',
                borderTop: `1px solid ${COLORS.borderInner}`,
              }}
            >
              {/* 手書き用空欄 */}
            </td>
          )}
          {/* 時間 */}
          <td style={{ ...cellBase, textAlign: 'left', borderBottom: rowBorderBottom }}>
            {timeLabel}
          </td>
          {/* 品目 */}
          <td style={{ ...cellBase, textAlign: 'left', borderBottom: rowBorderBottom }}>
            {item?.name || ''}
          </td>
          {/* 概算重量 */}
          <td style={{ ...cellBase, textAlign: 'right', borderBottom: rowBorderBottom, color: '#666' }}>
            {item?.estimatedWeight ? `${item.estimatedWeight}` : ''}
          </td>
          {/* 入力重量 (手書き空欄、ラベルのみ印字) */}
          <td style={{ ...cellBase, textAlign: 'right', borderBottom: rowBorderBottom }}>
            kg
          </td>
        </tr>,
      );

      if (isFirstRowInGroup && isFirstRow) isFirstRowInGroup = false;
    }
  });

  return (
    <table
      key={group.period}
      style={{
        width: '100%',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        marginBottom: '10px',
        fontSize: '10px',
        lineHeight: '1.3',
      }}
    >
      <colgroup>
        <col style={{ width: '4%' }} />   {/* 区分 */}
        <col style={{ width: '11%' }} />  {/* 管理 */}
        <col style={{ width: '17%' }} />  {/* 回収先 */}
        <col style={{ width: '22%' }} />  {/* 住所・その他 */}
        <col style={{ width: '5%' }} />   {/* 順番 */}
        <col style={{ width: '10%' }} />  {/* 時間 */}
        <col style={{ width: '15%' }} />  {/* 品目 */}
        <col style={{ width: '8%' }} />   {/* 概算重量 */}
        <col style={{ width: '8%' }} />   {/* 入力重量 */}
      </colgroup>

      {/* ヘッダー行 (最初のグループのみ表示) */}
      {groupIndex === 0 && (
        <thead>
          <tr style={{ backgroundColor: COLORS.bgGray }}>
            <th style={{ ...thBase }}></th>
            <th style={{ ...thBase }}>管理</th>
            <th style={{ ...thBase }}>回収先</th>
            <th style={{ ...thBase }}>住所・その他</th>
            <th style={{ ...thBase }}>順番</th>
            <th style={{ ...thBase }}>時間</th>
            <th style={{ ...thBase }}>品目</th>
            <th style={{ ...thBase }}>概算重量</th>
            <th style={{ ...thBase, borderRight: 'none' }}>入力重量</th>
          </tr>
        </thead>
      )}

      <tbody>{rows}</tbody>
    </table>
  );
}

/* =========================================================================
 * スタイル定数
 * ========================================================================= */
const cellBase: React.CSSProperties = {
  border: `1px solid ${COLORS.borderInner}`,
  padding: '3px 4px',
  textAlign: 'center',
  verticalAlign: 'middle',
  wordBreak: 'break-all',
};

const thBase: React.CSSProperties = {
  border: `1px solid ${COLORS.borderInner}`,
  borderBottom: `1px dashed ${COLORS.borderInner}`,
  padding: '3px 4px',
  fontWeight: 'bold',
  fontSize: '9px',
};

/* =========================================================================
 * メインコンポーネント
 * ========================================================================= */
export const PrintableDispatchSheet: React.FC<PrintableDispatchSheetProps> = ({
  driverId,
  drivers,
  jobs,
  customers,
  onCancel,
}) => {
  const printableData = useMemo(() => {
    if (!driverId) return null;
    return buildPrintableData(driverId, drivers, jobs, customers);
  }, [driverId, drivers, jobs, customers]);

  if (!driverId || !printableData) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#6b7280',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '32px',
        paddingBottom: '32px',
      }}
    >
      {/* アクションバー (印刷時は非表示) */}
      <div
        className="print-action-bar"
        style={{
          position: 'fixed',
          top: '16px',
          right: '32px',
          display: 'flex',
          gap: '16px',
          zIndex: 10000,
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '8px 24px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷する
        </button>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: '#1f2937',
            color: '#fff',
            padding: '8px 24px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          }}
        >
          閉じる
        </button>
      </div>

      {/* 印刷用CSS */}
      <style>{`
        @page { size: A4 portrait; margin: 6mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .print-action-bar { display: none !important; }
          .print-container {
            width: 100% !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 6mm !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* ================================================================
           A4キャンバス: 全体枠（青色の実線、やや太め）
           ================================================================ */}
      <div
        className="print-container"
        style={{
          width: '210mm',
          minHeight: '285mm', /* A4(297mm) - margin(12mm) */
          backgroundColor: '#fff',
          border: `3px solid ${COLORS.border}`,
          padding: '6mm',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          color: COLORS.text,
          fontSize: '11px',
          position: 'relative',
        }}
      >
        {/* ============================================================
            ヘッダーエリア（1行目） — テーブルと完全分離
            ============================================================ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            flexShrink: 0,
          }}
        >
          {/* 左側: 運行指示 [車両番号]車(空車約____kg) */}
          <div style={{ fontSize: '13px', fontWeight: 'bold', width: '30%' }}>
            運行指示 {printableData.vehicleName}車(空車約____kg)
          </div>

          {/* 中央: 水色の角丸枠 */}
          <div style={{ width: '40%', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                border: `2.5px solid ${COLORS.headerNotice}`,
                borderRadius: '8px',
                color: COLORS.headerNotice,
                fontWeight: 'bold',
                padding: '4px 16px',
                fontSize: '12px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              受領書を全て添付願います
            </div>
          </div>

          {/* 右側: 日付 曜日 */}
          <div style={{ fontSize: '13px', fontWeight: 'bold', width: '30%', textAlign: 'right' }}>
            {printableData.date}
          </div>
        </div>

        {/* ============================================================
            テーブルエリア（運行ブロック群）
            ============================================================ */}
        <div style={{ flex: 1 }}>
          {printableData.groups.map((group, groupIndex) =>
            renderGroupTable(group, groupIndex),
          )}
        </div>

        {/* ============================================================
            下部エリア（休憩・給油 / 連絡・報告 / チェック / サイン）
            ============================================================ */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: '12px',
            height: '80px',
            flexShrink: 0,
            fontSize: '9px',
          }}
        >
          {/* 左側ブロック: 休憩・給油 + 連絡・報告 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* 休憩・給油 */}
            <div style={{ display: 'flex', border: `1px solid ${COLORS.borderInner}`, height: '30%' }}>
              <div
                style={{
                  width: '80px',
                  backgroundColor: COLORS.bgGray,
                  borderRight: `1px solid ${COLORS.borderInner}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '9px',
                }}
              >
                休憩・給油
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
            {/* 連絡・報告事項 */}
            <div style={{ display: 'flex', border: `1px solid ${COLORS.borderInner}`, flex: 1 }}>
              <div
                style={{
                  width: '80px',
                  backgroundColor: COLORS.bgGray,
                  borderRight: `1px solid ${COLORS.borderInner}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '8px',
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                連絡・報告<br />事項
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, borderBottom: '1px dashed #999' }}></div>
                <div style={{ flex: 1, borderBottom: '1px dashed #999' }}></div>
                <div style={{ flex: 1 }}></div>
              </div>
            </div>
          </div>

          {/* 右側ブロック: チェック欄 + サイン枠 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* チェック欄 */}
            <div
              style={{
                border: `1px solid ${COLORS.borderInner}`,
                padding: '4px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <div style={{ fontWeight: 'bold', borderBottom: '1px dashed #999', paddingBottom: '2px', marginBottom: '2px', fontSize: '8px' }}>
                出発前・帰庫後チェック
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: `1px solid ${COLORS.borderInner}` }}></span>
                車両点検
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: `1px solid ${COLORS.borderInner}` }}></span>
                携行品確認
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: `1px solid ${COLORS.borderInner}` }}></span>
                アルコール検査
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: `1px solid ${COLORS.borderInner}` }}></span>
                鍵返却
              </div>
            </div>

            {/* サイン枠 */}
            {['管理者', '配車担当', '乗務員'].map((title) => (
              <div
                key={title}
                style={{
                  border: `1px solid ${COLORS.borderInner}`,
                  width: '52px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    borderBottom: `1px solid ${COLORS.borderInner}`,
                    backgroundColor: COLORS.bgGray,
                    textAlign: 'center',
                    padding: '2px 0',
                    fontWeight: 'bold',
                    fontSize: '8px',
                  }}
                >
                  {title}
                </div>
                <div style={{ flex: 1 }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
