import type { ReactNode } from "react";

export type ProjectType =
  | "newSystem"
  | "onpremToAws"
  | "awsToAws"
  | "databaseMigration"
  | "analyticsPlatform"
  | "staticWebsite"
  | "backupStorage"
  | "serverlessSystem";

export type CurrentEnvironment = "none" | "onprem" | "aws" | "azure" | "gcp" | "localServer";
export type WorkloadType =
  | "webApp"
  | "apiServer"
  | "batch"
  | "dataMigration"
  | "dbMigration"
  | "serverMigration"
  | "fileMigration"
  | "liftAndShift"
  | "accountRegionMigration"
  | "analytics"
  | "fileStorage"
  | "internalSystem"
  | "highTraffic";
export type DatabaseType = "none" | "unknown" | "oracle" | "mysql" | "postgresql" | "sqlserver" | "mongodb" | "auroraMysql" | "auroraPostgresql" | "dynamodb" | "documentdb";
export type MigrationMethod = "auto" | "snapshot" | "dms" | "dumpRestore" | "backupRestore" | "datasync" | "replication";
export type DataSize = "under10gb" | "100gb" | "1tb" | "over10tb";
export type Requirement = "lowCost" | "highAvailability" | "security" | "fastMigration" | "automation" | "scalability" | "lessOps";
export type ActiveTab = "architecture" | "cost" | "reason" | "risk";
export type CostCategory = "network" | "compute" | "database" | "storage" | "migration" | "security" | "monitoring" | "analytics" | "serverless";

export type SelectOption<T extends string> = {
  id: T;
  label: string;
  description?: string;
};

export type ArchitectureNode = {
  id: string;
  name: string;
  desc: string;
  reason: string;
  category: string;
};

export type CostItem = {
  name: string;
  monthly: number;
  note: string;
  category: CostCategory;
  detail?: string;
};

export type RecommendationResult = {
  title: string;
  summary: string;
  nodes: ArchitectureNode[];
  costItems: CostItem[];
  reasons: string[];
  risks: string[];
  totalMonthlyCost: number;
  pricingSource?: "local-estimate";
  pricingRegion?: string;
};

export type ProjectConfig = {
  projectType: ProjectType;
  currentEnvironment: CurrentEnvironment;
  workloadType: WorkloadType;
  databaseType: DatabaseType;
  sourceDatabaseType: DatabaseType;
  targetDatabaseType: DatabaseType;
  migrationMethod: MigrationMethod;
  dataSize: DataSize;
  users: number;
  requirements: Requirement[];
};

export type CardProps = {
  children: ReactNode;
  className?: string;
};

