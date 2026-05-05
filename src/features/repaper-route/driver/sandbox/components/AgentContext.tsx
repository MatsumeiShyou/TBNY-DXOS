import React, { createContext, useContext } from 'react';

const AgentNamespaceContext = createContext<string>('');

/**
 * AgentNamespace
 * 
 * 下位コンポーネントに対して階層的な名前空間（Namespace）を提供します。
 * 例: <AgentNamespace ns="inspection"> <Button agentId="save" /> </AgentNamespace>
 *     -> 出力される ID は "inspection:save"
 */
export const AgentNamespace: React.FC<{ ns: string; children: React.ReactNode }> = ({ ns, children }) => {
  const parentNs = useContext(AgentNamespaceContext);
  // ネストされた名前空間を結合（例: layout:header）
  const fullNs = parentNs ? `${parentNs}:${ns}` : ns;
  
  return (
    <AgentNamespaceContext.Provider value={fullNs}>
      {children}
    </AgentNamespaceContext.Provider>
  );
};

/**
 * useAgentId
 * 
 * コンテキストから取得した名前空間とローカルIDを結合します。
 */
export const useAgentId = (localId: string): string => {
  const ns = useContext(AgentNamespaceContext);
  if (!ns) return localId;
  
  // 重複排除: すでに名前空間が反映済みの場合は二重付与しない
  if (localId.startsWith(`${ns}:`)) return localId;
  
  return `${ns}:${localId}`;
};
