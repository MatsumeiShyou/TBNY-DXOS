/**
 * sandbox/types.ts — bridge/types.ts からの re-export
 * 
 * 型定義の SSOT は bridge/types.ts に移動。
 * 既存の sandbox 側の import パスを維持するために re-export する。
 */
export {
  StopStatus,
  DriverStatus,
  type ReasonCode,
  type Reason,
  type DecisionType,
  type Decision,
  type CargoItem,
  type Stop,
  type InspectionItem,
  type Vehicle,
  type BaseTask,
  type RouteInfo,
  type User,
  type Colleague,
} from '../bridge/types';
