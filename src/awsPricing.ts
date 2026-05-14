export type PricingRegion = "ap-northeast-1" | "us-east-1";

export type PricingSource = "local-estimate";

export type Ec2InstanceFamily = "t3" | "t4g" | "m5" | "m6i" | "m7g" | "c5" | "c6i" | "c7g" | "r5" | "r6i" | "r7g";
export type Ec2InstanceSize = "nano" | "micro" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | "4xlarge" | "8xlarge" | "9xlarge" | "12xlarge" | "16xlarge" | "18xlarge" | "24xlarge";
export type Ec2InstanceKey = `${Ec2InstanceFamily}.${Ec2InstanceSize}`;

export type DmsInstanceFamily = "dms.t3" | "dms.c5" | "dms.c6i" | "dms.r5" | "dms.r6i";
export type DmsInstanceSize = "micro" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | "4xlarge" | "8xlarge" | "9xlarge" | "12xlarge" | "16xlarge" | "18xlarge" | "24xlarge" | "32xlarge";
export type DmsInstanceKey = `${DmsInstanceFamily}.${DmsInstanceSize}`;

export type RdsInstanceFamily = "db.t3" | "db.t4g" | "db.m5" | "db.m6i" | "db.m7g" | "db.r5" | "db.r6i" | "db.r7g";
export type RdsInstanceSize = "micro" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | "4xlarge" | "8xlarge" | "12xlarge" | "16xlarge" | "24xlarge";
export type RdsInstanceKey = `${RdsInstanceFamily}.${RdsInstanceSize}`;

import type { Language } from "./i18n";

type InstancePrice<TKey extends string, TFamily extends string, TSize extends string> = {
  key: TKey;
  family: TFamily;
  size: TSize;
  label: string;
  description: string;
  hourly: number;
  monthly: number;
  vcpu?: number;
  memoryGiB?: number;
};

export type Ec2InstancePrice = InstancePrice<Ec2InstanceKey, Ec2InstanceFamily, Ec2InstanceSize>;
export type DmsInstancePrice = InstancePrice<DmsInstanceKey, DmsInstanceFamily, DmsInstanceSize>;
export type RdsInstancePrice = InstancePrice<RdsInstanceKey, RdsInstanceFamily, RdsInstanceSize>;

export type Ec2FamilyOption = { id: Ec2InstanceFamily; label: string; description: string };
export type DmsFamilyOption = { id: DmsInstanceFamily; label: string; description: string };
export type RdsFamilyOption = { id: RdsInstanceFamily; label: string; description: string };
export type SizeOption<TSize extends string> = { id: TSize; label: string; description: string };

export type PricingConfig = {
  region?: PricingRegion;
  dataSizeGb: number;
  migrationDays?: number;
  useDms?: boolean;
  useSnapshot?: boolean;
  useBackup?: boolean;
  useDataSync?: boolean;
  useS3Staging?: boolean;

  ec2InstanceKey?: Ec2InstanceKey;
  dmsInstanceKey?: DmsInstanceKey;
  rdsInstanceKey?: RdsInstanceKey;
  lang?: Language;
};

export type CostItemLike = {
  name: string;
  monthly: number;
  note: string;
  category: string;
  detail?: string;
};

export type PricingRates = {
  source: PricingSource;
  region: PricingRegion;
  currency: "USD";
  sourceLabel: string;
  rdsSnapshotGbMonth: number;
  backupWarmStorageGbMonth: number;
  s3StandardGbMonth: number;
  dataSyncGbTransfer: number;
  dmsStorageGbMonth: number;
  ec2: {
    selected: Ec2InstancePrice;
    instances: Ec2InstancePrice[];
  };
  dms: {
    selected: DmsInstancePrice;
    instances: DmsInstancePrice[];
  };
  rds: {
    selected: RdsInstancePrice;
    instances: RdsInstancePrice[];
  };
};

export const regionOptions: { id: PricingRegion; label: string; description: string }[] = [
  { id: "ap-northeast-1", label: "Tokyo / ap-northeast-1", description: "일본 도쿄 리전 기준 러프 견적" },
  { id: "us-east-1", label: "N. Virginia / us-east-1", description: "버지니아 북부 리전 기준 러프 견적" },
];

export const getEc2FamilyOptions = (lang: Language) => [
  { id: "t3", label: lang === "ja" ? "t3 - 汎用バースト / x86" : "t3 - 범용 버스트 / x86" },
  { id: "t4g", label: lang === "ja" ? "t4g - 汎用バースト / Graviton" : "t4g - 범용 버스트 / Graviton" },
  { id: "m5", label: lang === "ja" ? "m5 - 汎用 / x86" : "m5 - 범용 / x86" },
  { id: "m6i", label: lang === "ja" ? "m6i - 汎用 / 最新x86世代" : "m6i - 범용 / x86 최신 세대" },
  { id: "m7g", label: lang === "ja" ? "m7g - 汎用 / Graviton" : "m7g - 범용 / Graviton" },
  { id: "c5", label: lang === "ja" ? "c5 - コンピューティング最適化 / x86" : "c5 - 컴퓨팅 최적화 / x86" },
  { id: "c6i", label: lang === "ja" ? "c6i - コンピューティング最適化 / x86" : "c6i - 컴퓨팅 최적화 / x86" },
  { id: "c7g", label: lang === "ja" ? "c7g - コンピューティング最適化 / Graviton" : "c7g - 컴퓨팅 최적화 / Graviton" },
  { id: "r5", label: lang === "ja" ? "r5 - メモリ最適化 / x86" : "r5 - 메모리 최적화 / x86" },
  { id: "r6i", label: lang === "ja" ? "r6i - メモリ最適化 / x86" : "r6i - 메모리 최적화 / x86" },
  { id: "r7g", label: lang === "ja" ? "r7g - メモリ最適化 / Graviton" : "r7g - 메모리 최적화 / Graviton" },
] as const;

export const getDmsFamilyOptions = (lang: Language) => [
  { id: "dms.t3", label: lang === "ja" ? "dms.t3 - 汎用バースト" : "dms.t3 - 범용 버스트" },
  { id: "dms.c5", label: lang === "ja" ? "dms.c5 - コンピューティング最適化" : "dms.c5 - 컴퓨팅 최적화" },
  { id: "dms.c6i", label: lang === "ja" ? "dms.c6i - コンピューティング最適化" : "dms.c6i - 컴퓨팅 최적화" },
  { id: "dms.r5", label: lang === "ja" ? "dms.r5 - メモリ最適化" : "dms.r5 - 메모리 최적화" },
  { id: "dms.r6i", label: lang === "ja" ? "dms.r6i - メモリ最適化" : "dms.r6i - 메모리 최적화" },
] as const;

export const getRdsFamilyOptions = (lang: Language) => [
  { id: "db.t3", label: lang === "ja" ? "db.t3 - 汎用バースト" : "db.t3 - 범용 버스트" },
  { id: "db.m5", label: lang === "ja" ? "db.m5 - 汎用" : "db.m5 - 범용" },
  { id: "db.m6i", label: lang === "ja" ? "db.m6i - 汎用 / 最新x86世代" : "db.m6i - 범용 / x86 최신 세대" },
  { id: "db.r5", label: lang === "ja" ? "db.r5 - メモリ最適化" : "db.r5 - 메모리 최적화" },
  { id: "db.r6i", label: lang === "ja" ? "db.r6i - メモリ最適化" : "db.r6i - 메모리 최적화" },
] as const;

const HOURS_PER_MONTH = 730;

const ec2HourlyByRegion: Record<PricingRegion, Partial<Record<Ec2InstanceKey, number>>> = {
  "ap-northeast-1": {
    "t3.nano": 0.0068, "t3.micro": 0.0136, "t3.small": 0.0272, "t3.medium": 0.0544, "t3.large": 0.1088, "t3.xlarge": 0.2176, "t3.2xlarge": 0.4352,
    "t4g.nano": 0.0054, "t4g.micro": 0.0108, "t4g.small": 0.0216, "t4g.medium": 0.0432, "t4g.large": 0.0864, "t4g.xlarge": 0.1728, "t4g.2xlarge": 0.3456,
    "m5.large": 0.124, "m5.xlarge": 0.248, "m5.2xlarge": 0.496, "m5.4xlarge": 0.992, "m5.8xlarge": 1.984, "m5.12xlarge": 2.976, "m5.16xlarge": 3.968, "m5.24xlarge": 5.952,
    "m6i.large": 0.134, "m6i.xlarge": 0.268, "m6i.2xlarge": 0.536, "m6i.4xlarge": 1.072, "m6i.8xlarge": 2.144, "m6i.12xlarge": 3.216, "m6i.16xlarge": 4.288, "m6i.24xlarge": 6.432,
    "m7g.large": 0.1072, "m7g.xlarge": 0.2144, "m7g.2xlarge": 0.4288, "m7g.4xlarge": 0.8576, "m7g.8xlarge": 1.7152, "m7g.12xlarge": 2.5728, "m7g.16xlarge": 3.4304,
    "c5.large": 0.107, "c5.xlarge": 0.214, "c5.2xlarge": 0.428, "c5.4xlarge": 0.856, "c5.9xlarge": 1.926, "c5.12xlarge": 2.568, "c5.18xlarge": 3.852, "c5.24xlarge": 5.136,
    "c6i.large": 0.116, "c6i.xlarge": 0.232, "c6i.2xlarge": 0.464, "c6i.4xlarge": 0.928, "c6i.8xlarge": 1.856, "c6i.12xlarge": 2.784, "c6i.16xlarge": 3.712, "c6i.24xlarge": 5.568,
    "c7g.large": 0.0952, "c7g.xlarge": 0.1904, "c7g.2xlarge": 0.3808, "c7g.4xlarge": 0.7616, "c7g.8xlarge": 1.5232, "c7g.12xlarge": 2.2848, "c7g.16xlarge": 3.0464,
    "r5.large": 0.152, "r5.xlarge": 0.304, "r5.2xlarge": 0.608, "r5.4xlarge": 1.216, "r5.8xlarge": 2.432, "r5.12xlarge": 3.648, "r5.16xlarge": 4.864, "r5.24xlarge": 7.296,
    "r6i.large": 0.164, "r6i.xlarge": 0.328, "r6i.2xlarge": 0.656, "r6i.4xlarge": 1.312, "r6i.8xlarge": 2.624, "r6i.12xlarge": 3.936, "r6i.16xlarge": 5.248, "r6i.24xlarge": 7.872,
    "r7g.large": 0.1344, "r7g.xlarge": 0.2688, "r7g.2xlarge": 0.5376, "r7g.4xlarge": 1.0752, "r7g.8xlarge": 2.1504, "r7g.12xlarge": 3.2256, "r7g.16xlarge": 4.3008,
  },
  "us-east-1": {
    "t3.nano": 0.0052, "t3.micro": 0.0104, "t3.small": 0.0208, "t3.medium": 0.0416, "t3.large": 0.0832, "t3.xlarge": 0.1664, "t3.2xlarge": 0.3328,
    "t4g.nano": 0.0042, "t4g.micro": 0.0084, "t4g.small": 0.0168, "t4g.medium": 0.0336, "t4g.large": 0.0672, "t4g.xlarge": 0.1344, "t4g.2xlarge": 0.2688,
    "m5.large": 0.096, "m5.xlarge": 0.192, "m5.2xlarge": 0.384, "m5.4xlarge": 0.768, "m5.8xlarge": 1.536, "m5.12xlarge": 2.304, "m5.16xlarge": 3.072, "m5.24xlarge": 4.608,
    "m6i.large": 0.096, "m6i.xlarge": 0.192, "m6i.2xlarge": 0.384, "m6i.4xlarge": 0.768, "m6i.8xlarge": 1.536, "m6i.12xlarge": 2.304, "m6i.16xlarge": 3.072, "m6i.24xlarge": 4.608,
    "m7g.large": 0.0816, "m7g.xlarge": 0.1632, "m7g.2xlarge": 0.3264, "m7g.4xlarge": 0.6528, "m7g.8xlarge": 1.3056, "m7g.12xlarge": 1.9584, "m7g.16xlarge": 2.6112,
    "c5.large": 0.085, "c5.xlarge": 0.17, "c5.2xlarge": 0.34, "c5.4xlarge": 0.68, "c5.9xlarge": 1.53, "c5.12xlarge": 2.04, "c5.18xlarge": 3.06, "c5.24xlarge": 4.08,
    "c6i.large": 0.085, "c6i.xlarge": 0.17, "c6i.2xlarge": 0.34, "c6i.4xlarge": 0.68, "c6i.8xlarge": 1.36, "c6i.12xlarge": 2.04, "c6i.16xlarge": 2.72, "c6i.24xlarge": 4.08,
    "c7g.large": 0.0725, "c7g.xlarge": 0.145, "c7g.2xlarge": 0.29, "c7g.4xlarge": 0.58, "c7g.8xlarge": 1.16, "c7g.12xlarge": 1.74, "c7g.16xlarge": 2.32,
    "r5.large": 0.126, "r5.xlarge": 0.252, "r5.2xlarge": 0.504, "r5.4xlarge": 1.008, "r5.8xlarge": 2.016, "r5.12xlarge": 3.024, "r5.16xlarge": 4.032, "r5.24xlarge": 6.048,
    "r6i.large": 0.126, "r6i.xlarge": 0.252, "r6i.2xlarge": 0.504, "r6i.4xlarge": 1.008, "r6i.8xlarge": 2.016, "r6i.12xlarge": 3.024, "r6i.16xlarge": 4.032, "r6i.24xlarge": 6.048,
    "r7g.large": 0.1072, "r7g.xlarge": 0.2144, "r7g.2xlarge": 0.4288, "r7g.4xlarge": 0.8576, "r7g.8xlarge": 1.7152, "r7g.12xlarge": 2.5728, "r7g.16xlarge": 3.4304,
  },
};

const dmsHourlyByRegion: Record<PricingRegion, Partial<Record<DmsInstanceKey, number>>> = {
  "ap-northeast-1": {
    "dms.t3.micro": 0.036, "dms.t3.small": 0.072, "dms.t3.medium": 0.144, "dms.t3.large": 0.288,
    "dms.c5.large": 0.182, "dms.c5.xlarge": 0.364, "dms.c5.2xlarge": 0.728, "dms.c5.4xlarge": 1.456, "dms.c5.9xlarge": 3.276, "dms.c5.12xlarge": 4.368, "dms.c5.18xlarge": 6.552, "dms.c5.24xlarge": 8.736,
    "dms.c6i.large": 0.186, "dms.c6i.xlarge": 0.372, "dms.c6i.2xlarge": 0.744, "dms.c6i.4xlarge": 1.488, "dms.c6i.8xlarge": 2.976, "dms.c6i.12xlarge": 4.464, "dms.c6i.16xlarge": 5.952, "dms.c6i.24xlarge": 8.928, "dms.c6i.32xlarge": 11.904,
    "dms.r5.large": 0.232, "dms.r5.xlarge": 0.464, "dms.r5.2xlarge": 0.928, "dms.r5.4xlarge": 1.856, "dms.r5.8xlarge": 3.712, "dms.r5.12xlarge": 5.568, "dms.r5.16xlarge": 7.424, "dms.r5.24xlarge": 11.136,
    "dms.r6i.large": 0.252, "dms.r6i.xlarge": 0.504, "dms.r6i.2xlarge": 1.008, "dms.r6i.4xlarge": 2.016, "dms.r6i.8xlarge": 4.032, "dms.r6i.12xlarge": 6.048, "dms.r6i.16xlarge": 8.064, "dms.r6i.24xlarge": 12.096, "dms.r6i.32xlarge": 16.128,
  },
  "us-east-1": {
    "dms.t3.micro": 0.018, "dms.t3.small": 0.036, "dms.t3.medium": 0.072, "dms.t3.large": 0.144,
    "dms.c5.large": 0.154, "dms.c5.xlarge": 0.308, "dms.c5.2xlarge": 0.616, "dms.c5.4xlarge": 1.232, "dms.c5.9xlarge": 2.772, "dms.c5.12xlarge": 3.696, "dms.c5.18xlarge": 5.544, "dms.c5.24xlarge": 7.392,
    "dms.c6i.large": 0.17, "dms.c6i.xlarge": 0.34, "dms.c6i.2xlarge": 0.68, "dms.c6i.4xlarge": 1.36, "dms.c6i.8xlarge": 2.72, "dms.c6i.12xlarge": 4.08, "dms.c6i.16xlarge": 5.44, "dms.c6i.24xlarge": 8.16, "dms.c6i.32xlarge": 10.88,
    "dms.r5.large": 0.192, "dms.r5.xlarge": 0.384, "dms.r5.2xlarge": 0.768, "dms.r5.4xlarge": 1.536, "dms.r5.8xlarge": 3.072, "dms.r5.12xlarge": 4.608, "dms.r5.16xlarge": 6.144, "dms.r5.24xlarge": 9.216,
    "dms.r6i.large": 0.252, "dms.r6i.xlarge": 0.504, "dms.r6i.2xlarge": 1.008, "dms.r6i.4xlarge": 2.016, "dms.r6i.8xlarge": 4.032, "dms.r6i.12xlarge": 6.048, "dms.r6i.16xlarge": 8.064, "dms.r6i.24xlarge": 12.096, "dms.r6i.32xlarge": 16.128,
  },
};

const dmsSpecs: Partial<Record<DmsInstanceKey, { vcpu: number; memoryGiB: number }>> = {
  "dms.t3.micro": { vcpu: 2, memoryGiB: 1 },
  "dms.t3.small": { vcpu: 2, memoryGiB: 2 },
  "dms.t3.medium": { vcpu: 2, memoryGiB: 4 },
  "dms.t3.large": { vcpu: 2, memoryGiB: 8 },
  "dms.c5.large": { vcpu: 2, memoryGiB: 4 },
  "dms.c5.xlarge": { vcpu: 4, memoryGiB: 8 },
  "dms.c5.2xlarge": { vcpu: 8, memoryGiB: 16 },
  "dms.c5.4xlarge": { vcpu: 16, memoryGiB: 32 },
  "dms.c5.9xlarge": { vcpu: 36, memoryGiB: 72 },
  "dms.c5.12xlarge": { vcpu: 48, memoryGiB: 96 },
  "dms.c5.18xlarge": { vcpu: 72, memoryGiB: 144 },
  "dms.c5.24xlarge": { vcpu: 96, memoryGiB: 192 },
  "dms.c6i.large": { vcpu: 2, memoryGiB: 4 },
  "dms.c6i.xlarge": { vcpu: 4, memoryGiB: 8 },
  "dms.c6i.2xlarge": { vcpu: 8, memoryGiB: 16 },
  "dms.c6i.4xlarge": { vcpu: 16, memoryGiB: 32 },
  "dms.c6i.8xlarge": { vcpu: 32, memoryGiB: 64 },
  "dms.c6i.12xlarge": { vcpu: 48, memoryGiB: 96 },
  "dms.c6i.16xlarge": { vcpu: 64, memoryGiB: 128 },
  "dms.c6i.24xlarge": { vcpu: 96, memoryGiB: 192 },
  "dms.c6i.32xlarge": { vcpu: 128, memoryGiB: 256 },
  "dms.r5.large": { vcpu: 2, memoryGiB: 16 },
  "dms.r5.xlarge": { vcpu: 4, memoryGiB: 32 },
  "dms.r5.2xlarge": { vcpu: 8, memoryGiB: 64 },
  "dms.r5.4xlarge": { vcpu: 16, memoryGiB: 128 },
  "dms.r5.8xlarge": { vcpu: 32, memoryGiB: 256 },
  "dms.r5.12xlarge": { vcpu: 48, memoryGiB: 384 },
  "dms.r5.16xlarge": { vcpu: 64, memoryGiB: 512 },
  "dms.r5.24xlarge": { vcpu: 96, memoryGiB: 768 },
  "dms.r6i.large": { vcpu: 2, memoryGiB: 16 },
  "dms.r6i.xlarge": { vcpu: 4, memoryGiB: 32 },
  "dms.r6i.2xlarge": { vcpu: 8, memoryGiB: 64 },
  "dms.r6i.4xlarge": { vcpu: 16, memoryGiB: 128 },
  "dms.r6i.8xlarge": { vcpu: 32, memoryGiB: 256 },
  "dms.r6i.12xlarge": { vcpu: 48, memoryGiB: 384 },
  "dms.r6i.16xlarge": { vcpu: 64, memoryGiB: 512 },
  "dms.r6i.24xlarge": { vcpu: 96, memoryGiB: 768 },
  "dms.r6i.32xlarge": { vcpu: 128, memoryGiB: 1024 },
};


const rdsHourlyByRegion: Record<PricingRegion, Partial<Record<RdsInstanceKey, number>>> = {
  "ap-northeast-1": {
    "db.t3.micro": 0.026, "db.t3.small": 0.052, "db.t3.medium": 0.104, "db.t3.large": 0.208, "db.t3.xlarge": 0.416, "db.t3.2xlarge": 0.832,
    "db.t4g.micro": 0.021, "db.t4g.small": 0.042, "db.t4g.medium": 0.084, "db.t4g.large": 0.168, "db.t4g.xlarge": 0.336, "db.t4g.2xlarge": 0.672,
    "db.m5.large": 0.238, "db.m5.xlarge": 0.476, "db.m5.2xlarge": 0.952, "db.m5.4xlarge": 1.904, "db.m5.8xlarge": 3.808, "db.m5.12xlarge": 5.712, "db.m5.16xlarge": 7.616, "db.m5.24xlarge": 11.424,
    "db.m6i.large": 0.242, "db.m6i.xlarge": 0.484, "db.m6i.2xlarge": 0.968, "db.m6i.4xlarge": 1.936, "db.m6i.8xlarge": 3.872, "db.m6i.12xlarge": 5.808, "db.m6i.16xlarge": 7.744, "db.m6i.24xlarge": 11.616,
    "db.m7g.large": 0.194, "db.m7g.xlarge": 0.388, "db.m7g.2xlarge": 0.776, "db.m7g.4xlarge": 1.552, "db.m7g.8xlarge": 3.104, "db.m7g.12xlarge": 4.656, "db.m7g.16xlarge": 6.208,
    "db.r5.large": 0.31, "db.r5.xlarge": 0.62, "db.r5.2xlarge": 1.24, "db.r5.4xlarge": 2.48, "db.r5.8xlarge": 4.96, "db.r5.12xlarge": 7.44, "db.r5.16xlarge": 9.92, "db.r5.24xlarge": 14.88,
    "db.r6i.large": 0.326, "db.r6i.xlarge": 0.652, "db.r6i.2xlarge": 1.304, "db.r6i.4xlarge": 2.608, "db.r6i.8xlarge": 5.216, "db.r6i.12xlarge": 7.824, "db.r6i.16xlarge": 10.432, "db.r6i.24xlarge": 15.648,
    "db.r7g.large": 0.261, "db.r7g.xlarge": 0.522, "db.r7g.2xlarge": 1.044, "db.r7g.4xlarge": 2.088, "db.r7g.8xlarge": 4.176, "db.r7g.12xlarge": 6.264, "db.r7g.16xlarge": 8.352,
  },
  "us-east-1": {
    "db.t3.micro": 0.017, "db.t3.small": 0.034, "db.t3.medium": 0.068, "db.t3.large": 0.136, "db.t3.xlarge": 0.272, "db.t3.2xlarge": 0.544,
    "db.t4g.micro": 0.016, "db.t4g.small": 0.032, "db.t4g.medium": 0.064, "db.t4g.large": 0.128, "db.t4g.xlarge": 0.256, "db.t4g.2xlarge": 0.512,
    "db.m5.large": 0.192, "db.m5.xlarge": 0.384, "db.m5.2xlarge": 0.768, "db.m5.4xlarge": 1.536, "db.m5.8xlarge": 3.072, "db.m5.12xlarge": 4.608, "db.m5.16xlarge": 6.144, "db.m5.24xlarge": 9.216,
    "db.m6i.large": 0.192, "db.m6i.xlarge": 0.384, "db.m6i.2xlarge": 0.768, "db.m6i.4xlarge": 1.536, "db.m6i.8xlarge": 3.072, "db.m6i.12xlarge": 4.608, "db.m6i.16xlarge": 6.144, "db.m6i.24xlarge": 9.216,
    "db.m7g.large": 0.154, "db.m7g.xlarge": 0.308, "db.m7g.2xlarge": 0.616, "db.m7g.4xlarge": 1.232, "db.m7g.8xlarge": 2.464, "db.m7g.12xlarge": 3.696, "db.m7g.16xlarge": 4.928,
    "db.r5.large": 0.25, "db.r5.xlarge": 0.5, "db.r5.2xlarge": 1, "db.r5.4xlarge": 2, "db.r5.8xlarge": 4, "db.r5.12xlarge": 6, "db.r5.16xlarge": 8, "db.r5.24xlarge": 12,
    "db.r6i.large": 0.25, "db.r6i.xlarge": 0.5, "db.r6i.2xlarge": 1, "db.r6i.4xlarge": 2, "db.r6i.8xlarge": 4, "db.r6i.12xlarge": 6, "db.r6i.16xlarge": 8, "db.r6i.24xlarge": 12,
    "db.r7g.large": 0.2, "db.r7g.xlarge": 0.4, "db.r7g.2xlarge": 0.8, "db.r7g.4xlarge": 1.6, "db.r7g.8xlarge": 3.2, "db.r7g.12xlarge": 4.8, "db.r7g.16xlarge": 6.4,
  },
};

const localRatesByRegion: Record<PricingRegion, Omit<PricingRates, "ec2" | "dms" | "rds">> = {
  "ap-northeast-1": {
    source: "local-estimate",
    region: "ap-northeast-1",
    currency: "USD",
    sourceLabel: "Local static table based on AWS public pricing pages",
    dmsStorageGbMonth: 0.12,
    rdsSnapshotGbMonth: 0.095,
    backupWarmStorageGbMonth: 0.095,
    s3StandardGbMonth: 0.025,
    dataSyncGbTransfer: 0.0125,
  },
  "us-east-1": {
    source: "local-estimate",
    region: "us-east-1",
    currency: "USD",
    sourceLabel: "Local static table based on AWS public pricing pages",
    dmsStorageGbMonth: 0.115,
    rdsSnapshotGbMonth: 0.095,
    backupWarmStorageGbMonth: 0.095,
    s3StandardGbMonth: 0.023,
    dataSyncGbTransfer: 0.0125,
  },
};

function buildLabel(key: string) {
  return key;
}

function toEc2InstancePrice(region: PricingRegion, key: Ec2InstanceKey, lang: Language): Ec2InstancePrice {
  const [family, size] = key.split(".") as [Ec2InstanceFamily, Ec2InstanceSize];
  const hourly = ec2HourlyByRegion[region][key];
  const familyLabel = getEc2FamilyOptions(lang).find((item) => item.id === family)?.label ?? family;
  if (hourly == null) throw new Error(`Missing EC2 local price: ${region} ${key}`);

  return {
    key,
    family,
    size,
    label: buildLabel(key),
    description: familyLabel,
    hourly,
    monthly: Math.ceil(hourly * HOURS_PER_MONTH),
  };
}

function toDmsInstancePrice(region: PricingRegion, key: DmsInstanceKey, lang: Language): DmsInstancePrice {
  const parts = key.split(".");
  const family = `${parts[0]}.${parts[1]}` as DmsInstanceFamily;
  const size = parts[2] as DmsInstanceSize;
  const hourly = dmsHourlyByRegion[region][key];
  const familyLabel = getDmsFamilyOptions(lang).find((item) => item.id === family)?.label ?? family;
  const spec = dmsSpecs[key];
  if (hourly == null) throw new Error(`Missing DMS local price: ${region} ${key}`);

  return {
    key,
    family,
    size,
    label: buildLabel(key),
    description: spec ? `${familyLabel} / ${spec.vcpu} vCPU / ${spec.memoryGiB} GiB` : familyLabel,
    hourly,
    monthly: Math.ceil(hourly * HOURS_PER_MONTH),
    vcpu: spec?.vcpu,
    memoryGiB: spec?.memoryGiB,
  };
}

function toRdsInstancePrice(region: PricingRegion, key: RdsInstanceKey, lang: Language): RdsInstancePrice {
  const parts = key.split(".");
  const family = `${parts[0]}.${parts[1]}` as RdsInstanceFamily;
  const size = parts[2] as RdsInstanceSize;
  const hourly = rdsHourlyByRegion[region][key];
  const familyLabel = getRdsFamilyOptions(lang).find((item) => item.id === family)?.label ?? family;
  if (hourly == null) throw new Error(`Missing RDS local price: ${region} ${key}`);

  return {
    key,
    family,
    size,
    label: buildLabel(key),
    description: familyLabel,
    hourly,
    monthly: Math.ceil(hourly * HOURS_PER_MONTH),
  };
}
function getKeysByFamily<TKey extends string>(prices: Partial<Record<TKey, number>>, family: string): TKey[] {
  return Object.keys(prices).filter((key) => key.startsWith(`${family}.`)) as TKey[];
}

export function getEc2InstanceOptions(region: PricingRegion, family: Ec2InstanceFamily, lang: Language): Ec2InstancePrice[] {
  const resolvedRegion = localRatesByRegion[region] ? region : "ap-northeast-1";
  return getKeysByFamily(ec2HourlyByRegion[resolvedRegion], family).map((key) => toEc2InstancePrice(resolvedRegion, key, lang));
}

export function getDmsInstanceOptions(region: PricingRegion, family: DmsInstanceFamily, lang: Language): DmsInstancePrice[] {
  const resolvedRegion = localRatesByRegion[region] ? region : "ap-northeast-1";
  return getKeysByFamily(dmsHourlyByRegion[resolvedRegion], family).map((key) => toDmsInstancePrice(resolvedRegion, key, lang));
}

export function getRdsInstanceOptions(region: PricingRegion, family: RdsInstanceFamily, lang: Language): RdsInstancePrice[] {
  const resolvedRegion = localRatesByRegion[region] ? region : "ap-northeast-1";
  return getKeysByFamily(rdsHourlyByRegion[resolvedRegion], family).map((key) => toRdsInstancePrice(resolvedRegion, key, lang));
}

export function getLocalPricingRates(
  region: PricingRegion = "ap-northeast-1",
  ec2InstanceKey: Ec2InstanceKey = "t3.micro",
  dmsInstanceKey: DmsInstanceKey = "dms.r5.large",
  rdsInstanceKey: RdsInstanceKey = "db.r5.large",
  lang: Language = "ja"
): PricingRates {
  const resolvedRegion = localRatesByRegion[region] ? region : "ap-northeast-1";
  const ec2Instances = Object.keys(ec2HourlyByRegion[resolvedRegion]).map((key) => toEc2InstancePrice(resolvedRegion, key as Ec2InstanceKey, lang));
  const dmsInstances = Object.keys(dmsHourlyByRegion[resolvedRegion]).map((key) => toDmsInstancePrice(resolvedRegion, key as DmsInstanceKey, lang));
  const rdsInstances = Object.keys(rdsHourlyByRegion[resolvedRegion]).map((key) => toRdsInstancePrice(resolvedRegion, key as RdsInstanceKey, lang));
  const selectedEc2 = ec2Instances.find((item) => item.key === ec2InstanceKey) ?? toEc2InstancePrice(resolvedRegion, "t3.micro", lang);
  const selectedDms = dmsInstances.find((item) => item.key === dmsInstanceKey) ?? toDmsInstancePrice(resolvedRegion, "dms.r5.large", lang);
  const selectedRds = rdsInstances.find((item) => item.key === rdsInstanceKey) ?? toRdsInstancePrice(resolvedRegion, "db.r5.large", lang);

  return {
    ...localRatesByRegion[resolvedRegion],
    ec2: { selected: selectedEc2, instances: ec2Instances },
    dms: { selected: selectedDms, instances: dmsInstances },
    rds: { selected: selectedRds, instances: rdsInstances },
  };
}

export function buildMigrationPricingItems(
  config: PricingConfig,
  rates = getLocalPricingRates(
    config.region ?? "ap-northeast-1",
    config.ec2InstanceKey ?? "t3.micro",
    config.dmsInstanceKey ?? "dms.r5.large",
    config.rdsInstanceKey ?? "db.r5.large",
    config.lang ?? "ja"
  )): CostItemLike[] {
  const migrationDays = config.migrationDays ?? 7;
  const dmsHours = Math.max(24, migrationDays * 24);
  const dataSizeGb = Math.max(1, config.dataSizeGb);
  const items: CostItemLike[] = [];
  const isJa = config.lang === "ja";

  if (config.useDms) {
    const selectedDms = rates.dms.selected;
    const instanceCost = Math.ceil(selectedDms.hourly * dmsHours);
    const fullMonthCost = Math.ceil(selectedDms.hourly * HOURS_PER_MONTH);
    const includedStorageGb = selectedDms.family === "dms.t3" ? 50 : 100;
    const requiredStorageGb = Math.max(includedStorageGb, Math.round(dataSizeGb * 0.1));
    const billableStorageGb = Math.max(0, requiredStorageGb - includedStorageGb);
    const storageCost = Math.ceil(billableStorageGb * rates.dmsStorageGbMonth);

    items.push({
      name: `AWS DMS ${selectedDms.label}`,
      monthly: instanceCost,
      note: isJa
        ? `${rates.region} / ${selectedDms.label} / ${selectedDms.hourly.toFixed(4)} USD/hour × ${dmsHours}時間を基準とした移行期間の概算。730時間継続稼働した場合は約$${fullMonthCost}/月${selectedDms.vcpu ? ` / ${selectedDms.vcpu} vCPU, ${selectedDms.memoryGiB} GiB` : ""}`
        : `${rates.region} / ${selectedDms.label} / ${selectedDms.hourly.toFixed(4)} USD/hour × ${dmsHours}시간 기준 이행 기간 추정. 730시간 계속 켜두면 약 $${fullMonthCost}/월${selectedDms.vcpu ? ` / ${selectedDms.vcpu} vCPU, ${selectedDms.memoryGiB} GiB` : ""}`,
      category: "migration",
      detail: isJa
        ? `$${selectedDms.hourly.toFixed(4)}/hour × ${dmsHours}時間 = $${instanceCost}`
        : `$${selectedDms.hourly.toFixed(4)}/hour × ${dmsHours} hours = $${instanceCost}`,
    });
    items.push({
      name: "AWS DMS Extra Replication Storage",
      monthly: storageCost,
      note: isJa
        ? `選択したインスタンスの基本含有ストレージ${includedStorageGb}GBを除き、追加${billableStorageGb.toLocaleString()}GBを基準としたローカル概算。CDCログが長期間蓄積される場合、コストが増加する可能性がある。`
        : `선택 인스턴스 기본 포함 스토리지 ${includedStorageGb}GB 제외 후 추가 ${billableStorageGb.toLocaleString()}GB 기준 로컬 추정. CDC 로그가 길게 쌓이면 증가한다.`,
      category: "migration",
      detail: isJa
        ? `${billableStorageGb.toLocaleString()}GB × $${rates.dmsStorageGbMonth}/GB-month = $${storageCost}`
        : `${billableStorageGb.toLocaleString()}GB × $${rates.dmsStorageGbMonth}/GB-month = $${storageCost}`,
    });
  }

  if (config.useSnapshot) {
    const selectedRds = rates.rds.selected;
    items.push({
      name: `Target DB Instance ${selectedRds.label}`,
      monthly: selectedRds.monthly,
      note: isJa
        ? `${rates.region} / ${selectedRds.label} / ${selectedRds.hourly.toFixed(4)} USD/hour × 730時間を基準とした概算。スナップショット自体がではなく、復元後に稼働する対象DBインスタンスのコスト。`
        : `${rates.region} / ${selectedRds.label} / ${selectedRds.hourly.toFixed(4)} USD/hour × 730시간 기준. 스냅샷 자체가 아니라 복원 후 실행되는 대상 DB 인스턴스 비용이다.`,
      category: "database",
      detail: `$${selectedRds.hourly.toFixed(4)}/hour × 730 hours = $${selectedRds.monthly}`,
    });

    const snapshotCost = Math.ceil(dataSizeGb * rates.rdsSnapshotGbMonth);

    items.push({
      name: "RDS/Aurora Snapshot Storage",
      monthly: Math.ceil(dataSizeGb * rates.rdsSnapshotGbMonth),
      note: isJa
        ? `${dataSizeGb.toLocaleString()}GB-monthの基準ローカル概算。スナップショットストレージはDBインスタンスクラスよりも保存容量/保持期間に大きく左右されます。`
        : `${dataSizeGb.toLocaleString()}GB-month 기준 로컬 추정. 스냅샷 스토리지는 DB 인스턴스 클래스보다 저장 용량/보관 기간에 더 크게 좌우된다.`,
      category: "storage",
      detail: `${dataSizeGb.toLocaleString()}GB × $${rates.rdsSnapshotGbMonth}/GB-month = $${snapshotCost}`,
    });
  }

  if (config.useBackup) {
    const backupCost = Math.ceil(dataSizeGb * rates.backupWarmStorageGbMonth);

    items.push({
      name: "AWS Backup Storage",
      monthly: Math.ceil(dataSizeGb * rates.backupWarmStorageGbMonth),
      note: isJa
        ? `${dataSizeGb.toLocaleString()}GB warm backup の基準ローカル概算。復元リクエスト/転送費用は別途。`
        : `${dataSizeGb.toLocaleString()}GB warm backup 기준 로컬 추정. 복원 요청/전송 비용은 별도.`,
      category: "storage",
      detail: `${dataSizeGb.toLocaleString()}GB × $${rates.backupWarmStorageGbMonth}/GB-month = $${backupCost}`,
    });
  }

  if (config.useS3Staging) {
    const s3StagingCost = Math.ceil(dataSizeGb * rates.s3StandardGbMonth);

    items.push({
      name: "S3 Staging Storage",
      monthly: Math.ceil(dataSizeGb * rates.s3StandardGbMonth),
      note: isJa
        ? `덤프/CSV/검증파일 ${dataSizeGb.toLocaleString()}GB 臨時保存基準ローカル概算。`
        : `Dump/CSV/Validation files ${dataSizeGb.toLocaleString()}GB 임시 저장 기준 로컬 추정.`,
      category: "storage",
      detail: `${dataSizeGb.toLocaleString()}GB × $${rates.s3StandardGbMonth}/GB-month = $${s3StagingCost}`,
    });
  }

  if (config.useDataSync) {
    const dataSyncCost = Math.ceil(dataSizeGb * rates.dataSyncGbTransfer);

    items.push({
      name: "AWS DataSync Transfer",
      monthly: Math.ceil(dataSizeGb * rates.dataSyncGbTransfer),
      note: isJa
        ? `${dataSizeGb.toLocaleString()}GB 送信基準ローカル概算。ネットワーク/VPC endpoint 費用は別途。`
        : `${dataSizeGb.toLocaleString()}GB 전송 기준 로컬 추정. 네트워크/VPC endpoint 비용은 별도.`,
      category: "migration",
      detail: `${dataSizeGb.toLocaleString()}GB × $${rates.dataSyncGbTransfer}/GB = $${dataSyncCost}`,
    });
  }

  return items;
}
