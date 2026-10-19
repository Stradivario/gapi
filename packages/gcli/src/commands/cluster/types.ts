/**
 * Shapes of the cluster-provisioner operations the scaling / health
 * commands use. Local (like commands/runner/types.ts) because these fields
 * (controlPlanes, autoscale, the overview) are newer than the generated
 * @introspection types. Mirrors gql-fission's
 * core/services/cluster/{mutations,queries}/*.graphql.
 */

export const ClusterChangeFragment = `
id
projectId
name
status
region
serverType
topology {
  workers
  singleNode
  controlPlanes
}
withLoadBalancer
loadBalancerIp
error
`;

export const ClusterAutoscaleFragment = `
enabled
minWorkers
maxWorkers
cpuScaleUpPercent
memScaleUpPercent
cpuScaleDownPercent
memScaleDownPercent
samplesToScale
cooldownMinutes
lastScaledAt
lastEvaluatedAt
lastDecision
`;

export const ClusterOverviewFragment = `
clusterId
name
status
overall
agentOnline
agentLastSeenAt
agentVersion
health {
  reportedAt
  nodesTotal
  nodesReady
  nodesSchedulable
  pods
  pendingPods
  cpuRequestsPercent
  memRequestsPercent
  cpuUsagePercent
  memUsagePercent
  fissionReady
  prometheusReady
  kubernetesVersion
}
autoscale {
  enabled
  minWorkers
  maxWorkers
  lastDecision
  lastScaledAt
}
monthToDate {
  period
  nodeHours
  loadBalancerHours
  totalCostEur
  totalCostUsd
}
estimatedMonthlyCostEur
issues {
  severity
  code
  message
}
`;

export const ClusterHealthFragment = `
id
clusterId
createdAt
agentVersion
kubernetesVersion
pods
pendingPods
fissionReady
prometheusReady
metricsAvailable
cpuRequestsPercent
memRequestsPercent
cpuUsagePercent
memUsagePercent
nodes {
  name
  role
  ready
  instanceType
  cpuRequests
  cpuUsage
  cpuAllocatable
  memRequests
  memUsage
  memAllocatable
  podCount
  cordoned
}
`;

export const ClusterScaleEventFragment = `
createdAt
trigger
direction
fromWorkers
toWorkers
reason
cpuRequestsPercent
memRequestsPercent
pendingPods
error
`;

export interface ClusterChange {
  id: string;
  projectId?: string;
  name: string;
  status: string;
  region?: string;
  serverType?: string;
  topology?: {
    workers?: number;
    singleNode?: boolean;
    controlPlanes?: number;
  };
  withLoadBalancer?: boolean;
  loadBalancerIp?: string | null;
  error?: string | null;
}

export interface ClusterAutoscalePolicy {
  enabled?: boolean;
  minWorkers?: number;
  maxWorkers?: number;
  cpuScaleUpPercent?: number;
  memScaleUpPercent?: number;
  cpuScaleDownPercent?: number;
  memScaleDownPercent?: number;
  samplesToScale?: number;
  cooldownMinutes?: number;
  lastScaledAt?: string | null;
  lastEvaluatedAt?: string | null;
  lastDecision?: string | null;
}

export interface ClusterOverview {
  clusterId: string;
  name: string;
  status: string;
  overall: string;
  agentOnline?: boolean;
  agentLastSeenAt?: string | null;
  agentVersion?: string | null;
  health?: {
    reportedAt?: string;
    nodesTotal?: number;
    nodesReady?: number;
    nodesSchedulable?: number;
    pods?: number;
    pendingPods?: number;
    cpuRequestsPercent?: number;
    memRequestsPercent?: number;
    cpuUsagePercent?: number;
    memUsagePercent?: number;
    fissionReady?: boolean;
    prometheusReady?: boolean;
    kubernetesVersion?: string;
  } | null;
  autoscale?: {
    enabled?: boolean;
    minWorkers?: number;
    maxWorkers?: number;
    lastDecision?: string | null;
    lastScaledAt?: string | null;
  } | null;
  monthToDate?: {
    period?: string;
    nodeHours?: number;
    loadBalancerHours?: number;
    totalCostEur?: number;
    totalCostUsd?: number;
  } | null;
  estimatedMonthlyCostEur?: number | null;
  issues?: { severity: string; code: string; message: string }[];
}

export interface ClusterHealthNode {
  name: string;
  role?: string;
  ready?: boolean;
  instanceType?: string;
  cpuRequests?: number;
  cpuUsage?: number;
  cpuAllocatable?: number;
  memRequests?: number;
  memUsage?: number;
  memAllocatable?: number;
  podCount?: number;
  cordoned?: boolean;
}

export interface ClusterHealthSnapshot {
  id: string;
  clusterId: string;
  createdAt: string;
  agentVersion?: string;
  kubernetesVersion?: string;
  pods?: number;
  pendingPods?: number;
  fissionReady?: boolean;
  prometheusReady?: boolean;
  metricsAvailable?: boolean;
  cpuRequestsPercent?: number;
  memRequestsPercent?: number;
  cpuUsagePercent?: number;
  memUsagePercent?: number;
  nodes?: ClusterHealthNode[];
}

export interface ClusterScaleEvent {
  createdAt: string;
  trigger?: string;
  direction?: string;
  fromWorkers?: number;
  toWorkers?: number;
  reason?: string | null;
  cpuRequestsPercent?: number;
  memRequestsPercent?: number;
  pendingPods?: number;
  error?: string | null;
}
