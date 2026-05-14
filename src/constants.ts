import type { ProjectType, CurrentEnvironment, WorkloadType, DatabaseType, MigrationMethod, DataSize, Requirement, SelectOption } from "./types";

export const projectTypes: SelectOption<ProjectType>[] = [
  { id: "newSystem", label: "신규 시스템 개발", description: "새 웹/API/업무 시스템을 AWS에 구축" },
  { id: "onpremToAws", label: "온프레미스 → AWS 이행", description: "사내 서버/DB를 AWS로 이전" },
  { id: "awsToAws", label: "AWS → AWS 이행", description: "계정/리전/구조 변경 또는 재설계" },
  { id: "databaseMigration", label: "DB 마이그레이션", description: "DB 엔진/위치/운영방식 변경" },
  { id: "analyticsPlatform", label: "데이터 분석 플랫폼", description: "로그/데이터 레이크/분석 환경 구축" },
  { id: "staticWebsite", label: "정적 웹사이트 구축", description: "S3 + CloudFront 중심 정적 사이트" },
  { id: "backupStorage", label: "파일 저장/백업 시스템", description: "파일 저장, 아카이빙, 백업" },
  { id: "serverlessSystem", label: "서버리스 시스템", description: "Lambda/API Gateway/DynamoDB 중심" },
];

export const environments: SelectOption<CurrentEnvironment>[] = [
  { id: "none", label: "아직 없음" },
  { id: "onprem", label: "온프레미스" },
  { id: "aws", label: "AWS" },
  { id: "azure", label: "Azure" },
  { id: "gcp", label: "GCP" },
  { id: "localServer", label: "로컬 서버" },
];

export const workloadTypes: SelectOption<WorkloadType>[] = [
  { id: "webApp", label: "웹 애플리케이션", description: "화면/프론트/API/DB가 있는 일반 서비스" },
  { id: "apiServer", label: "API 서버", description: "모바일/프론트엔드용 백엔드 API" },
  { id: "batch", label: "배치 처리", description: "정기 실행, 대량 처리, 스케줄 작업" },
  { id: "dataMigration", label: "대용량 데이터 이관", description: "파일, 로그, 덤프, 오브젝트 데이터 이동" },
  { id: "dbMigration", label: "DB 마이그레이션", description: "Oracle/MySQL/PostgreSQL/SQL Server 등 DB 이전" },
  { id: "serverMigration", label: "서버 이행", description: "EC2/MGN 중심 서버 Lift & Shift" },
  { id: "fileMigration", label: "파일 스토리지 이행", description: "NAS/파일서버/S3/EFS/FSx 이전" },
  { id: "liftAndShift", label: "전체 시스템 Lift & Shift", description: "서버, DB, 파일을 함께 AWS로 이전" },
  { id: "accountRegionMigration", label: "계정/리전 이전", description: "AWS 계정 통합, 리전 이동, 구조 재배치" },
  { id: "analytics", label: "데이터 분석", description: "데이터 레이크, ETL, BI, 로그 분석" },
  { id: "fileStorage", label: "파일 저장소", description: "이미지, 문서, 백업, 아카이브 저장" },
  { id: "internalSystem", label: "사내 업무 시스템", description: "관리자, ERP성 업무, 내부 툴" },
  { id: "highTraffic", label: "고트래픽 서비스", description: "캐시, 큐, 오토스케일링이 중요한 서비스" },
];

export const databaseTypes: SelectOption<DatabaseType>[] = [
  { id: "none", label: "없음" },
  { id: "unknown", label: "모르겠음" },
  { id: "oracle", label: "Oracle" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlserver", label: "SQL Server" },
  { id: "mongodb", label: "MongoDB" },
  { id: "auroraMysql", label: "Aurora MySQL" },
  { id: "auroraPostgresql", label: "Aurora PostgreSQL" },
  { id: "dynamodb", label: "DynamoDB" },
  { id: "documentdb", label: "DocumentDB" },
];

export const migrationMethods: SelectOption<MigrationMethod>[] = [
  { id: "auto", label: "자동 추천", description: "소스/대상/데이터 규모로 적합한 이행 방식을 추천" },
  { id: "snapshot", label: "스냅샷/복원", description: "Aurora/RDS 계열에서 빠른 복제·리전/계정 이전에 적합" },
  { id: "dms", label: "AWS DMS", description: "이기종 DB 또는 다운타임 최소화가 필요할 때 적합" },
  { id: "dumpRestore", label: "Dump/Restore", description: "소규모 DB를 단순 백업 파일로 이전" },
  { id: "backupRestore", label: "AWS Backup 복원", description: "AWS 리소스 백업 기반 복구/이전" },
  { id: "datasync", label: "DataSync/S3 Staging", description: "DB 덤프·CSV·파일 기반 이관" },
  { id: "replication", label: "네이티브 복제", description: "엔진별 replication으로 단계적 전환" },
];

export const dataSizes: SelectOption<DataSize>[] = [
  { id: "under10gb", label: "10GB 이하" },
  { id: "100gb", label: "100GB급" },
  { id: "1tb", label: "1TB급" },
  { id: "over10tb", label: "10TB 이상" },
];

export const requirements: SelectOption<Requirement>[] = [
  { id: "lowCost", label: "비용 최소화" },
  { id: "highAvailability", label: "고가용성" },
  { id: "security", label: "보안 강화" },
  { id: "fastMigration", label: "빠른 이행" },
  { id: "automation", label: "운영 자동화" },
  { id: "scalability", label: "확장성" },
  { id: "lessOps", label: "서버 관리 최소화" },
];

export const userPresets = [
  { label: "1천+", value: 1000, description: "소규모", detail: "개인/사내 서비스" },
  { label: "1만+", value: 10000, description: "초기 상용", detail: "기본 운영 구성" },
  { label: "10만+", value: 100000, description: "성장 단계", detail: "트래픽 분산 필요" },
  { label: "50만+", value: 500000, description: "고트래픽", detail: "캐시/비동기 중요" },
  { label: "100만+", value: 1000000, description: "대규모", detail: "고가용성 필수" },
] as const;


export const iconMap: Record<string, string> = {
  users: "👥",
  route53: "🌐",
  cloudfront: "☁️",
  waf: "🛡️",
  alb: "⚖️",
  ec2: "🖥️",
  ecs: "📦",
  lambda: "λ",
  apiGateway: "🚪",
  rds: "🗄️",
  aurora: "🗄️",
  dynamodb: "⚡",
  s3: "🪣",
  dms: "🚚",
  mgn: "🛫",
  datasync: "🔁",
  migrationHub: "🧭",
  snowball: "📦",
  vpn: "🔐",
  directConnect: "🔌",
  codepipeline: "🧱",
  cloudwatch: "📊",
  iam: "🔑",
  opensearch: "🔎",
  glue: "🧬",
  athena: "🔍",
  redshift: "🏛️",
  backup: "💾",
  snapshot: "📸",
  replication: "🔄",
  sct: "🧩",
  ecr: "📚",
  sqs: "📨",
};


