import { createContext, useContext } from 'react';

export const AgentNamespaceContext = createContext<string>('');

export const useAgentId = (localId: string): string => {
  const ns = useContext(AgentNamespaceContext);
  if (!ns) return localId;
  if (localId.startsWith(`${ns}:`)) return localId;
  return `${ns}:${localId}`;
};
