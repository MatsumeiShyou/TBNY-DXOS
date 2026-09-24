import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PrintableDispatchSheetData, PrintableGroup } from '../../utils/printUtils';

const COLORS = {
  border: '#0056b3',
  borderInner: '#333',
  headerNotice: '#00a2e8',
  bgGray: '#f5f5f5',
  bgGrayLight: '#fafafa',
  text: '#111',
};

const styles = StyleSheet.create({
  page: {
    padding: '6mm',
    fontFamily: 'NotoSansJP',
    fontSize: 8,
    color: COLORS.text,
  },
  container: {
    flex: 1,
    border: `3pt solid ${COLORS.border}`,
    padding: '6mm',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
  },
  headerCenter: {
    width: '40%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noticeBox: {
    border: `2pt solid ${COLORS.headerNotice}`,
    borderRadius: 6,
    color: COLORS.headerNotice,
    padding: '4pt 12pt',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerRight: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1pt solid ${COLORS.borderInner}`,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgGray,
    borderBottom: `1pt dashed ${COLORS.borderInner}`,
    fontWeight: 'bold',
    fontSize: 7,
  },
  th: {
    borderRight: `1pt solid ${COLORS.borderInner}`,
    padding: '3pt',
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1pt solid ${COLORS.borderInner}`,
  },
  td: {
    borderRight: `1pt solid ${COLORS.borderInner}`,
    padding: '3pt',
  },
  tdDashedBottom: {
    borderBottom: `1pt dashed ${COLORS.borderInner}`,
  },
  tdDottedBottom: {
    borderBottom: `1pt dotted #999`,
  },
  // Rowspan columns
  colPeriod: { width: '4%', backgroundColor: COLORS.bgGray, justifyContent: 'center', alignItems: 'center' },
  colManager: { width: '8%' },
  colCustomer: { width: '22%' },
  colAddress: { width: '24%' },
  colOrder: { width: '4%' }, // 手書き順番
  // Items columns container (will hold multiple rows)
  colItemsContainer: { flex: 1, flexDirection: 'column' },
  // Inner rows for items
  itemRow: { flexDirection: 'row', flex: 1 },
  colTime: { width: '15%', borderRight: `1pt solid ${COLORS.borderInner}`, padding: '3pt' },
  colItem: { width: '40%', borderRight: `1pt solid ${COLORS.borderInner}`, padding: '3pt' },
  colEstWeight: { width: '15%', borderRight: `1pt solid ${COLORS.borderInner}`, padding: '3pt', textAlign: 'right', color: '#666' },
  colInputWeight: { width: '30%', padding: '3pt', textAlign: 'right' },
  
  // Tags
  tag: {
    border: '1pt solid #dc2626',
    color: '#dc2626',
    padding: '1pt 2pt',
    borderRadius: 2,
    fontSize: 5,
    marginRight: 2,
    marginBottom: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  
  // Footer
  footer: {
    marginTop: 'auto',
    borderTop: `2pt solid ${COLORS.borderInner}`,
    paddingTop: 4,
    flexDirection: 'row',
  },
  footerSection: {
    flex: 1,
    borderRight: `1pt solid ${COLORS.borderInner}`,
    padding: 4,
  },
  footerSectionLast: {
    flex: 1,
    padding: 4,
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 8,
    height: 8,
    border: '1pt solid #333',
    marginRight: 4,
  },
});

interface Props {
  data: PrintableDispatchSheetData;
}

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <View style={[styles.th, { width: '4%' }]}><Text>区分</Text></View>
    <View style={[styles.th, { width: '8%' }]}><Text>管理</Text></View>
    <View style={[styles.th, { width: '22%' }]}><Text>回収先</Text></View>
    <View style={[styles.th, { width: '24%' }]}><Text>住所・その他</Text></View>
    <View style={[styles.th, { width: '4%' }]}><Text>順番</Text></View>
    <View style={[styles.th, { flex: 1 }]}>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{ width: '15%', borderRight: `1pt solid ${COLORS.borderInner}`, justifyContent: 'center' }}><Text>時間</Text></View>
        <View style={{ width: '40%', borderRight: `1pt solid ${COLORS.borderInner}`, justifyContent: 'center' }}><Text>品目</Text></View>
        <View style={{ width: '15%', borderRight: `1pt solid ${COLORS.borderInner}`, justifyContent: 'center' }}><Text>概算</Text></View>
        <View style={{ width: '30%', justifyContent: 'center' }}><Text>入力重量</Text></View>
      </View>
    </View>
  </View>
);

const renderGroup = (group: PrintableGroup) => {
  return (
    <View key={group.period} style={styles.table} wrap={false}>
      <TableHeader />
      {group.blocks.map((block, i) => {
        const isStartAtsugi = block.isAtsugi && block.id.includes('start');
        const isEndAtsugi = block.isAtsugi && block.id.includes('end');
        
        let managerStr = block.manager || '';
        if (managerStr.trim() === block.customerName?.trim()) {
          managerStr = '';
        }

        return (
          <View key={block.id} style={[styles.tableRow, block.isAtsugi ? { backgroundColor: COLORS.bgGrayLight } : {}]} wrap={false}>
            {/* 区分列: グループの最初のブロックのみ期間を表示し、それ以外は空（またはボーダーなし） */}
            <View style={[styles.td, styles.colPeriod, i > 0 ? { borderBottom: 'none' } : {}]}>
              {i === 0 ? <Text style={{ transform: 'rotate(90deg)' }}>{group.period}</Text> : null}
            </View>

            {block.isAtsugi ? (
              // 厚木事業所行
              <React.Fragment>
                <View style={[styles.td, styles.colManager, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]} />
                <View style={[styles.td, styles.colCustomer, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]}>
                  <Text style={{ fontWeight: 'bold' }}>{isEndAtsugi ? '厚木事業所に到着（帰庫）' : '厚木事業所'}</Text>
                </View>
                <View style={[styles.td, styles.colAddress, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]} />
                <View style={[styles.td, styles.colOrder, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]} />
                
                <View style={[styles.colItemsContainer, { flexDirection: 'row' }]}>
                  <View style={[styles.colTime, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]}>
                    <Text>{isStartAtsugi ? '出発 :' : '到着 :'}</Text>
                  </View>
                  <View style={[styles.colItem, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]}>
                    <Text style={{ fontWeight: 'bold' }}>{isStartAtsugi ? '総重量→' : ''}</Text>
                  </View>
                  <View style={[styles.colEstWeight, { borderBottom: `1pt dashed ${COLORS.borderInner}` }]} />
                  <View style={[styles.colInputWeight, { borderBottom: `1pt dashed ${COLORS.borderInner}`, ...(isStartAtsugi ? { border: `2pt solid ${COLORS.borderInner}` } : {}) }]} />
                </View>
              </React.Fragment>
            ) : (
              // 通常案件行
              <React.Fragment>
                <View style={[styles.td, styles.colManager]}><Text>{managerStr}</Text></View>
                <View style={[styles.td, styles.colCustomer]}>
                  <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{block.customerName}</Text>
                  {block.schedule ? <Text style={{ fontSize: 6, color: '#666' }}>{block.schedule}</Text> : null}
                </View>
                <View style={[styles.td, styles.colAddress]}>
                  <Text>{block.address}</Text>
                  {block.notes && block.notes.filter(Boolean).length > 0 && (
                    <View style={styles.tagsContainer}>
                      {block.notes.filter(Boolean).map((n, idx) => (
                        <Text key={idx} style={styles.tag}>{n}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <View style={[styles.td, styles.colOrder]} />

                {/* Items rows */}
                <View style={styles.colItemsContainer}>
                  {Array.from({ length: block.rowCount }).map((_, rIdx) => {
                    const item = block.items?.[rIdx];
                    const timeLabel = rIdx === 0 ? '到着 :' : rIdx === 1 ? '出発 :' : '';
                    const isLastItemRow = rIdx === block.rowCount - 1;
                    const borderBottomStyle = isLastItemRow ? 'none' : `1pt dotted #999`;

                    return (
                      <View key={rIdx} style={[styles.itemRow, { borderBottom: borderBottomStyle }]}>
                        <View style={styles.colTime}><Text>{timeLabel}</Text></View>
                        <View style={styles.colItem}><Text>{item?.name || ''}</Text></View>
                        <View style={styles.colEstWeight}><Text>{item?.estimatedWeight || ''}</Text></View>
                        <View style={styles.colInputWeight}>
                          <Text style={{ textAlign: 'right' }}>kg</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </React.Fragment>
            )}
          </View>
        );
      })}
    </View>
  );
};

export const PrintableDispatchDocument = ({ data }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header} wrap={false}>
            <View style={styles.headerLeft}>
              <Text>運行指示 {data.vehicleName}車(空車約____kg)</Text>
            </View>
            <View style={styles.headerCenter}>
              <View style={styles.noticeBox}>
                <Text>受領書を全て添付願います</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text>{data.date}</Text>
            </View>
          </View>

          {/* Tables Area */}
          <View style={{ flex: 1 }}>
            {data.groups.map((group) => renderGroup(group))}
          </View>

          {/* Footer Area */}
          <View style={styles.footer} wrap={false}>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>休憩・給油等</Text>
              <Text style={{ color: '#666' }}>※作業以外の時間を記入</Text>
            </View>
            <View style={[styles.footerSection, { flex: 1.5 }]}>
              <Text style={styles.footerTitle}>連絡・報告事項</Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>確認チェック</Text>
              <View style={styles.checkboxRow}><View style={styles.checkbox} /><Text>日報記入</Text></View>
              <View style={styles.checkboxRow}><View style={styles.checkbox} /><Text>受領書添付</Text></View>
            </View>
            <View style={styles.footerSectionLast}>
              <Text style={styles.footerTitle}>サイン</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
