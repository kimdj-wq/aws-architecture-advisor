import { buildMigrationPricingItems, getLocalPricingRates, type PricingRates } from "../awsPricing";
import { workloadTypes } from "../constants";
import { optionText } from "../i18n";
import type { Language } from "../i18n";
import type {
  ArchitectureNode,
  CostItem,
  CostCategory,
  DataSize,
  DatabaseType,
  MigrationMethod,
  ProjectConfig,
  ProjectType,
  RecommendationResult,
  Requirement,
  SelectOption,
  WorkloadType,
  RiskBadge,
} from "../types";

export function getProjectTypeDefaults(projectType: ProjectType): Partial<ProjectConfig> {
  switch (projectType) {
    case "onpremToAws":
      return { currentEnvironment: "onprem", workloadType: "liftAndShift", sourceDatabaseType: "oracle", targetDatabaseType: "auroraPostgresql", migrationMethod: "auto" };
    case "awsToAws":
      return { currentEnvironment: "aws", workloadType: "accountRegionMigration", sourceDatabaseType: "auroraPostgresql", targetDatabaseType: "auroraPostgresql", migrationMethod: "auto" };
    case "databaseMigration":
      return { workloadType: "dbMigration", sourceDatabaseType: "oracle", targetDatabaseType: "auroraPostgresql", migrationMethod: "auto" };
    case "analyticsPlatform":
      return { workloadType: "analytics" };
    case "staticWebsite":
      return { currentEnvironment: "none", workloadType: "webApp", databaseType: "none", sourceDatabaseType: "none", targetDatabaseType: "none", migrationMethod: "auto" };
    case "backupStorage":
      return { workloadType: "fileStorage", migrationMethod: "auto" };
    case "serverlessSystem":
      return { workloadType: "apiServer", databaseType: "none", sourceDatabaseType: "none", targetDatabaseType: "dynamodb", migrationMethod: "auto" };
    case "newSystem":
    default:
      return { currentEnvironment: "none", workloadType: "webApp", sourceDatabaseType: "none", targetDatabaseType: "auroraPostgresql", migrationMethod: "auto" };
  }
}

const workloadOptionsByProjectType: Record<ProjectType, WorkloadType[]> = {
  newSystem: ["webApp", "apiServer", "batch", "internalSystem", "highTraffic"],
  onpremToAws: ["liftAndShift", "serverMigration", "dbMigration", "fileMigration", "dataMigration"],
  awsToAws: ["accountRegionMigration", "dbMigration", "fileMigration", "dataMigration", "highTraffic"],
  databaseMigration: ["dbMigration", "dataMigration"],
  analyticsPlatform: ["analytics", "dataMigration", "batch"],
  staticWebsite: ["webApp", "highTraffic"],
  backupStorage: ["fileStorage", "fileMigration", "dataMigration"],
  serverlessSystem: ["apiServer", "batch", "webApp"],
};

export function getAvailableWorkloadTypes(projectType: ProjectType): SelectOption<WorkloadType>[] {
  const allowed = workloadOptionsByProjectType[projectType];
  return workloadTypes.filter((option) => allowed.includes(option.id));
}

export function getEnvironmentHelperText(projectType: ProjectType, language: Language = "ja"): string {
  if (language === "ja") {
    if (projectType === "onpremToAws") return "プロジェクトタイプにより、現在の環境はオンプレミスに自動設定されます。";
    if (projectType === "awsToAws") return "プロジェクトタイプにより、現在の環境はAWSに自動設定されます。";
    if (projectType === "staticWebsite" || projectType === "newSystem") return "新規構築のため、現在の環境は未構築として扱います。";
    return "DB移行は移行元の場所が複数あり得るため、現在の環境を調整できます。";
  }
  if (projectType === "onpremToAws") return "프로젝트 유형 때문에 현재 환경이 온프레미스로 자동 설정된다.";
  if (projectType === "awsToAws") return "프로젝트 유형 때문에 현재 환경이 AWS로 자동 설정된다.";
  if (projectType === "staticWebsite" || projectType === "newSystem") return "신규 구축 성격이라 현재 환경은 없음으로 자동 설정된다.";
  return "DB 마이그레이션은 소스 위치가 다양하므로 현재 환경을 직접 조정할 수 있다.";
}

export function getWorkloadHelperText(projectType: ProjectType, language: Language = "ja"): string {
  if (language === "ja") {
    if (projectType === "onpremToAws") return "オンプレミス移行は、サーバー/DB/ファイル/全体移行に分けて整理します。";
    if (projectType === "awsToAws") return "AWS内部移行は、アカウント/リージョン移行、DB変更、ファイル移行を区別します。";
    if (projectType === "databaseMigration") return "DB移行はDB移行が基本です。Dumpやファイル中心の場合は大容量データ移行を選択します。";
    return "プロジェクトの性質に合わせてワークロードを選択します。";
  }
  if (projectType === "onpremToAws") return "온프레미스 이행은 서버/DB/파일/전체 이행 중 하나로 세분화한다.";
  if (projectType === "awsToAws") return "AWS 내부 이행은 계정/리전 이전, DB 변경, 파일 이관 등을 구분한다.";
  if (projectType === "databaseMigration") return "DB 마이그레이션은 기본값이 DB 마이그레이션이다. 덤프/파일 중심이면 대용량 데이터 이관을 선택한다.";
  return "프로젝트 성격에 맞춰 워크로드를 선택한다.";
}

export function normalizeWorkloadForProject(projectType: ProjectType, workloadType: WorkloadType): WorkloadType {
  const allowed = workloadOptionsByProjectType[projectType];
  if (allowed.includes(workloadType)) return workloadType;
  return getProjectTypeDefaults(projectType).workloadType ?? allowed[0];
}

function hasRequirement(config: ProjectConfig, requirement: Requirement): boolean {
  return config.requirements.includes(requirement);
}

function getTrafficLevel(users: number): 1 | 2 | 3 | 4 {
  if (users < 5000) return 1;
  if (users < 50000) return 2;
  if (users < 500000) return 3;
  return 4;
}

function getDataSizeMultiplier(dataSize: DataSize): number {
  if (dataSize === "under10gb") return 1;
  if (dataSize === "100gb") return 2;
  if (dataSize === "1tb") return 5;
  return 14;
}

function getDataSizeGb(dataSize: DataSize): number {
  if (dataSize === "under10gb") return 10;
  if (dataSize === "100gb") return 100;
  if (dataSize === "1tb") return 1024;
  return 10240;
}

function isAuroraOrRdsFamily(databaseType: DatabaseType): boolean {
  return ["mysql", "postgresql", "auroraMysql", "auroraPostgresql"].includes(databaseType);
}

function isRelationalDatabase(databaseType: DatabaseType): boolean {
  return ["oracle", "mysql", "postgresql", "sqlserver", "auroraMysql", "auroraPostgresql"].includes(databaseType);
}

function isConfiguredDatabase(databaseType: DatabaseType): boolean {
  return databaseType !== "none" && databaseType !== "unknown";
}

function getDatabaseLabel(databaseType: DatabaseType, language: Language): string {
  return optionText[language].databaseTypes[databaseType]?.label ?? databaseType;
}

export function getResolvedMigrationMethod(config: ProjectConfig): MigrationMethod {
  if (config.migrationMethod !== "auto") return config.migrationMethod;

  const sameEngine = config.sourceDatabaseType === config.targetDatabaseType;
  const awsInternal = config.projectType === "awsToAws" || config.currentEnvironment === "aws";
  const sourceAuroraRds = isAuroraOrRdsFamily(config.sourceDatabaseType);
  const targetAuroraRds = isAuroraOrRdsFamily(config.targetDatabaseType);

  if (config.workloadType === "fileMigration" || config.workloadType === "dataMigration") return "datasync";
  if (awsInternal && sameEngine && sourceAuroraRds && targetAuroraRds) return "snapshot";
  if (config.dataSize === "under10gb" && sameEngine) return "dumpRestore";
  if (!sameEngine || hasRequirement(config, "fastMigration") || hasRequirement(config, "highAvailability")) return "dms";
  if (config.dataSize === "over10tb") return "replication";
  return "dms";
}

export function getMigrationMethodLabel(method: MigrationMethod, language: Language = "ja"): string {
  return optionText[language].migrationMethods[method]?.label ?? method;
}

function t(language: Language) {
  return language === "ja"
    ? {
        baseTitle: "AWS推奨アーキテクチャ",
        baseSummary: "入力条件に基づいてAWSサービスの組み合わせを推奨しました。",
        migrationTitle: "移行推奨アーキテクチャ",
        dbMigrationTitle: "DB移行推奨アーキテクチャ",
        migrationSummary: "現在の環境からAWSへ安全にシステムとデータを移行し、運用切替リスクを抑える構成を推奨しました。",
        dbMigrationSummary: "DBエンジン、スキーマ、データレプリケーション、カットオーバーリスクを中心に移行構成を推奨しました。",
        staticTitle: "静的Webサイト推奨アーキテクチャ",
        staticSummary: "サーバー運用負荷を最小化し、CDNで高速配信する構成です。",
        analyticsTitle: "データ分析基盤推奨アーキテクチャ",
        analyticsSummary: "S3データレイクを中心に、収集・加工・クエリ・分析を分離する構成です。",
        storageTitle: "ファイル保存/バックアップ推奨アーキテクチャ",
        storageSummary: "S3とライフサイクルポリシーを中心に、コストを抑えつつ長期保管を自動化する構成です。",
        serverlessTitle: "サーバーレス新規システム推奨アーキテクチャ",
        newSystemTitle: "新規システム推奨アーキテクチャ",
        serverlessSummary: "サーバー運用負荷を抑え、Lambda中心で構成するアーキテクチャです。",
        newSystemSummary: "Web/APIアプリケーションを安定運用するための基本的なAWSアーキテクチャです。",
        usersDesc: (users: number) => `${users.toLocaleString()}人のユーザー`,
        rough: "概算",
        month: "月",
        nodes: {
          iam: ["IAM", "権限管理", "すべてのAWS設計の基本です。最小権限の原則でユーザー、ロール、サービス権限を分離します。", "Security"],
          waf: ["AWS WAF", "Webファイアウォール", "外部公開Web/APIでは、OWASP系攻撃、Bot、異常リクエストを防御します。", "Security"],
          vpn: ["Site-to-Site VPN", "オンプレミス-AWS接続", "小規模/短期移行はVPNベースの接続から開始できます。", "Network"],
          directConnect: ["Direct Connect / Site-to-Site VPN", "オンプレミス-AWS接続", "大容量または長期同期移行では、安定した専用線またはVPN構成を検討します。", "Network"],
          migrationHub: ["AWS Migration Hub", "移行進捗の統合管理", "サーバー、DB、ファイル移行作業を一元的に追跡し、カットオーバー準備状況を管理します。", "Governance"],
          organizations: ["AWS Organizations / IAM", "アカウント/権限ベースライン", "AWS内部移行では、アカウント構造、権限境界、リージョンポリシーを先に整理する必要があります。", "Governance"],
          mgn: ["AWS Application Migration Service", "サーバーLift & Shift", "既存サーバーをEC2ベースで複製し、カットオーバーするサーバー移行に適しています。", "Migration"],
          ec2Target: ["EC2 Target Environment", "移行先サーバー", "Lift & Shift後に性能、コスト、運用負荷を見てECS/EKS/サーバーレスへのモダナイズを検討します。", "Compute"],
          dms: ["AWS DMS", "DBデータレプリケーション", "Full LoadとCDCでDB移行時のダウンタイムを抑えます。", "Migration"],
          sct: ["AWS SCT", "スキーマ変換", "異種DB移行時にテーブル、インデックス、関数、プロシージャ互換性を分析します。", "Migration"],
          snapshot: ["RDS/Aurora Snapshot", "スナップショット復元", "同系統のAurora/RDS移行では、スナップショット復元/共有/コピーがDMSより単純な場合があります。", "Migration"],
          backup: ["AWS Backup", "バックアップ/復旧管理", "アカウント/リージョン移行または復旧シナリオをバックアップポリシーで管理します。", "Migration"],
          datasync: ["AWS DataSync", "ファイル/オブジェクト移行", "NAS、ファイルサーバー、S3間の大量ファイル移動を自動化し、検証します。", "Migration"],
          s3Migration: ["S3 Migration Bucket", "移行ファイル/バックアップ保存", "CSV、Dump、ログ、中間成果物を安全に保管するステージング領域です。", "Storage"],
          snowball: ["AWS Snowball検討", "超大容量オフライン移行", "10TB以上ではネットワーク移行期間が長くなる可能性があるため、オフライン移行も候補になります。", "Migration"],
          cloudwatch: ["CloudWatch", "ログ/メトリクス/アラーム", "障害対応、性能分析、コスト追跡のため、すべての構成で必要です。", "Monitoring"],
          route53: ["Route 53", "DNS", "ドメインをAWSのエントリーポイントに接続します。", "Network"],
          cloudfront: ["CloudFront", "CDN", "静的リソースやキャッシュ可能なレスポンスをエッジで処理します。", "Network"],
          s3Static: ["S3 Static Hosting", "静的ファイル保存", "HTML、CSS、JS、画像ファイルをオブジェクトストレージに保存します。", "Storage"],
          codepipeline: ["CodePipeline / CodeBuild", "CI/CD", "ビルド、テスト、デプロイプロセスを自動化します。", "DevOps"],
          s3Lake: ["S3 Data Lake", "元データ保存", "ログ、CSV、Parquetなどの元データを低コストで長期保存します。", "Storage"],
          glue: ["AWS Glue", "ETL / Catalog", "データカタログとETL処理で分析可能な形式へ加工します。", "Analytics"],
          athena: ["Athena", "サーバーレスSQL分析", "S3データを直接SQLで照会します。初期分析環境に適しています。", "Analytics"],
          redshift: ["Redshift", "データウェアハウス", "大規模な定型分析とBIクエリ性能が必要な場合に使用します。", "Analytics"],
          s3: ["S3", "ファイルストレージ", "ファイル、バックアップ、画像、ログをオブジェクトストレージに保存します。", "Storage"],
          users: ["Users", "ユーザー", "ユーザーリクエストがシステムに流入します。", "Client"],
          apiGateway: ["API Gateway", "APIエントリーポイント", "HTTP APIリクエストをLambdaへルーティングし、認証/スロットリングを適用します。", "Compute"],
          lambda: ["Lambda", "サーバーレスコンピューティング", "サーバー管理なしでリクエスト単位にコードを実行します。", "Compute"],
          dynamodb: ["DynamoDB", "サーバーレスNoSQL DB", "サーバーレス構成と相性がよく、トラフィック変動に対応しやすいDBです。", "Database"],
          alb: ["ALB", "ロードバランサー", "複数のアプリサーバーへリクエストを分散し、Health Checkを行います。", "Network"],
          app: ["EC2 App Server", "アプリケーション実行", "初期規模ではEC2ベース構成が単純でコストを抑えやすいです。", "Compute"],
          ecs: ["ECS on Fargate", "アプリケーション実行", "コンテナベースのデプロイとAuto Scalingで運用柔軟性を確保します。", "Compute"],
          sqs: ["SQS", "非同期キュー", "メール、通知、外部API呼び出し、バッチ処理を非同期に分離します。", "Integration"],
          ecr: ["ECR", "コンテナイメージリポジトリ", "ECS/EKSベースのデプロイ時にイメージ保存先として使用します。", "DevOps"],
        },
        reasons: {
          security: "セキュリティ強化要件があるため、IAM最小権限、WAF、Security Group、ログ監査を基本設計に含めます。",
          awsInternal: "AWS → AWS移行では、単純コピーよりもアカウント、リージョン、ネットワーク、IAM権限境界の設計が先です。",
          serverMigration: "サーバー移行はAWS Application Migration Serviceで先に移行し、安定化後にモダナイズする進め方が現実的です。",
          dbMigration: (source: string, target: string, method: string) => `DB移行は${source} → ${target}の切替を前提に、${method}方式を優先的に検討します。`,
          methodCost: (method: string) => `${method}も実際のAWSサービス/移行構成要素であるため、推奨構成とコスト項目に含めます。`,
          dbMethod: "AWS内部のAurora/RDS系移行はスナップショット/バックアップ復元が単純な場合があり、異種DBや無停止要件がある場合はDMS + SCTがより適しています。",
          fileMigration: "ファイル/Dump/ログ移行は、DMSよりDataSyncとS3ステージング構成が適しています。",
          static: "静的WebサイトはEC2なしでS3 + CloudFront構成にすると、コストと運用負荷を抑えられます。",
          analytics: "分析ワークロードは、元データ保存(S3)、加工(Glue)、参照(Athena/Redshift)を分離する方が保守しやすいです。",
          storage: "ファイル保存/バックアップは、S3 Standard、IA、Glacier階層へライフサイクルポリシーで自動移行する方式が適しています。",
          serverless: "サーバー管理の最小化要件があるため、EC2/ECSよりAPI Gateway + Lambda + DynamoDB構成が適しています。",
          web: "一般的なWeb/APIシステムは、Route 53 → CloudFront → ALB → App → DBの流れが基本構成です。",
          sqs: "トラフィック増加時、同期処理だけではボトルネックになるため、SQSで重い処理を分離します。",
          automation: "運用自動化要件があるため、CI/CDパイプラインとイメージリポジトリを設計に含めます。",
          lowCost: "コスト最適化要件があるため、初期段階ではマネージドサービスの最小構成と従量課金サービスを優先的に検討します。",
          ha: "高可用性要件があるため、Multi-AZ、Health Check、Auto Scaling、マネージドDB構成を優先します。",
        },
        risks: {
          lift: "Lift & Shiftは速い一方、運用方式までそのまま移すためコスト最適化効果が小さい場合があります。",
          db: "DB移行では、移行元/移行先エンジン、スキーマ互換性、データ整合性、カットオーバー時間、ロールバック計画を合わせて確認する必要があります。",
          nosql: "NoSQLまたはドキュメントDBが含まれる場合、単純移行よりもデータモデルとアプリケーションのクエリパターン再設計が必要になる可能性があります。",
          commercialDb: "Oracle/SQL ServerからオープンソースDBへ変更する場合、プロシージャ、関数、シーケンス、日付処理、文字コード互換性の問題が発生しやすいです。",
          cutover: "カットオーバー計画、ロールバック手順、データ整合性検証クエリ、性能ベースラインを事前に文書化する必要があります。",
          large: "大容量移行では、ネットワーク帯域、カットオーバー時間、増分レプリケーション遅延を必ず見積もる必要があります。",
          static: "S3バケットをpublicにするより、CloudFront OAC/OAIでアクセス制御する方が安全です。",
          athena: "Athenaコストはクエリのスキャンデータ量に敏感なため、Parquet変換とパーティショニングを検討する必要があります。",
          backup: "バックアップは保存だけで終わらず、復旧テストを定期的に実施する必要があります。",
          lowCost: "コスト最適化だけを優先すると、Multi-AZ、バックアップ、モニタリングが弱くなり、障害対応力が下がる可能性があります。",
          ha: "高可用性構成はコストが増加します。RTO/RPO要件を先に決めることで過剰設計を避けられます。",
          license: "商用DBはライセンス費用とBYOL条件を確認する必要があります。単純なインフラ費用よりライセンス費用が大きくなる場合があります。",
          over10tb: "10TB以上のデータはオンライン移行だけにこだわらず、Snowball、Direct Connect、段階的移行を検討する必要があります。",
          default: "正確な見積もりには、リージョン、インスタンスタイプ、トラフィックパターン、データ転送量、バックアップ保管期間が必要です。",
        },
      }
    : {
        baseTitle: "AWS 추천 아키텍처",
        baseSummary: "입력 조건을 기반으로 AWS 서비스 조합을 추천했다.",
        migrationTitle: "마이그레이션 추천 아키텍처",
        dbMigrationTitle: "DB 마이그레이션 추천 아키텍처",
        migrationSummary: "현재 환경에서 AWS로 안전하게 시스템과 데이터를 이동하고, 운영 전환 리스크를 줄이는 구성을 추천했다.",
        dbMigrationSummary: "DB 엔진, 스키마, 데이터 복제, 컷오버 리스크를 중심으로 이전 구조를 추천했다.",
        staticTitle: "정적 웹사이트 추천 아키텍처",
        staticSummary: "서버 운영 부담을 최소화하고 CDN으로 빠르게 배포하는 구조다.",
        analyticsTitle: "데이터 분석 플랫폼 추천 아키텍처",
        analyticsSummary: "S3 데이터 레이크를 중심으로 수집, 정제, 쿼리, 분석을 분리하는 구성이다.",
        storageTitle: "파일 저장/백업 추천 아키텍처",
        storageSummary: "S3와 수명주기 정책을 중심으로 비용을 낮추고 장기 보관을 자동화하는 구조다.",
        serverlessTitle: "서버리스 신규 시스템 추천 아키텍처",
        newSystemTitle: "신규 시스템 추천 아키텍처",
        serverlessSummary: "서버 운영 부담을 줄이고 Lambda 중심으로 구성하는 아키텍처다.",
        newSystemSummary: "웹/API 애플리케이션을 안정적으로 운영하기 위한 기본 AWS 아키텍처다.",
        usersDesc: (users: number) => `${users.toLocaleString()}명 사용자`,
        rough: "러프 추정",
        month: "월",
        nodes: {
          iam: ["IAM", "권한 관리", "모든 AWS 설계의 기본이다. 사용자, 역할, 서비스 권한을 최소 권한 원칙으로 분리한다.", "Security"],
          waf: ["AWS WAF", "Web 방화벽", "외부 공개 웹/API라면 OWASP 유형 공격, 봇, 비정상 요청을 방어한다.", "Security"],
          vpn: ["Site-to-Site VPN", "온프레미스-AWS 연결", "소규모/단기 이행은 VPN 기반 연결로 시작할 수 있다.", "Network"],
          directConnect: ["Direct Connect / Site-to-Site VPN", "온프레미스-AWS 연결", "대용량 또는 장기 동기화 이행은 안정적인 전용 연결 또는 VPN 구성을 검토한다.", "Network"],
          migrationHub: ["AWS Migration Hub", "이행 진행상황 통합 관리", "서버, DB, 파일 이행 작업을 한 화면에서 추적하고 컷오버 준비 상태를 관리한다.", "Governance"],
          organizations: ["AWS Organizations / IAM", "계정/권한 기준선", "AWS 내부 이행은 계정 구조, 권한 경계, 리전 정책을 먼저 정리해야 한다.", "Governance"],
          mgn: ["AWS Application Migration Service", "서버 Lift & Shift", "기존 서버를 EC2 기반으로 복제하고 컷오버하는 서버 이행에 적합하다.", "Migration"],
          ec2Target: ["EC2 Target Environment", "마이그레이션 대상 서버", "Lift & Shift 이후 성능, 비용, 관리 부담을 보고 ECS/EKS/서버리스 현대화를 검토한다.", "Compute"],
          dms: ["AWS DMS", "DB 데이터 복제", "full load와 CDC로 DB 이행 시 다운타임을 줄인다.", "Migration"],
          sct: ["AWS SCT", "스키마 변환", "이기종 DB 전환 시 테이블, 인덱스, 함수, 프로시저 호환성을 분석한다.", "Migration"],
          snapshot: ["RDS/Aurora Snapshot", "스냅샷 복원", "같은 계열의 Aurora/RDS 이행은 스냅샷 복원/공유/복사가 DMS보다 단순할 수 있다.", "Migration"],
          backup: ["AWS Backup", "백업/복구 관리", "계정/리전 이전 또는 복구 시나리오를 백업 정책으로 관리한다.", "Migration"],
          datasync: ["AWS DataSync", "파일/오브젝트 이관", "NAS, 파일 서버, S3 간 대량 파일 이동을 자동화하고 검증한다.", "Migration"],
          s3Migration: ["S3 Migration Bucket", "이행 파일/백업 저장", "CSV, dump, 로그, 중간 산출물을 안전하게 보관하는 스테이징 영역이다.", "Storage"],
          snowball: ["AWS Snowball 검토", "초대용량 오프라인 이관", "10TB 이상에서는 네트워크 이관 기간이 길어질 수 있어 오프라인 이관도 후보가 된다.", "Migration"],
          cloudwatch: ["CloudWatch", "로그/메트릭/알람", "장애 대응, 성능 분석, 비용 추적을 위해 모든 구성에서 필요하다.", "Monitoring"],
          route53: ["Route 53", "DNS", "도메인을 AWS 진입점으로 연결한다.", "Network"],
          cloudfront: ["CloudFront", "CDN", "정적 리소스와 캐싱 가능한 응답을 엣지에서 처리한다.", "Network"],
          s3Static: ["S3 Static Hosting", "정적 파일 저장", "HTML, CSS, JS, 이미지 파일을 객체 스토리지에 저장한다.", "Storage"],
          codepipeline: ["CodePipeline / CodeBuild", "CI/CD", "빌드, 테스트, 배포 과정을 자동화한다.", "DevOps"],
          s3Lake: ["S3 Data Lake", "원천 데이터 저장", "로그, CSV, Parquet 등 원천 데이터를 저비용으로 장기 저장한다.", "Storage"],
          glue: ["AWS Glue", "ETL / Catalog", "데이터 카탈로그와 ETL 처리로 분석 가능한 형태로 정제한다.", "Analytics"],
          athena: ["Athena", "서버리스 SQL 분석", "S3 데이터를 직접 SQL로 조회한다. 초기 분석 환경에 적합하다.", "Analytics"],
          redshift: ["Redshift", "데이터 웨어하우스", "대규모 정형 분석과 BI 쿼리 성능이 필요할 때 사용한다.", "Analytics"],
          s3: ["S3", "파일 저장소", "파일, 백업, 이미지, 로그를 객체 스토리지에 저장한다.", "Storage"],
          users: ["Users", "사용자", "사용자 요청이 시스템으로 유입된다.", "Client"],
          apiGateway: ["API Gateway", "API 진입점", "HTTP API 요청을 Lambda로 라우팅하고 인증/스로틀링을 적용한다.", "Compute"],
          lambda: ["Lambda", "서버리스 컴퓨팅", "서버 관리 없이 요청 단위로 코드를 실행한다.", "Compute"],
          dynamodb: ["DynamoDB", "서버리스 NoSQL DB", "서버리스 구조와 잘 맞고 트래픽 변화에 대응하기 쉽다.", "Database"],
          alb: ["ALB", "로드 밸런서", "여러 앱 서버로 요청을 분산하고 Health Check를 수행한다.", "Network"],
          app: ["EC2 App Server", "애플리케이션 실행", "초기 규모에서는 EC2 기반 구성이 단순하고 비용이 낮다.", "Compute"],
          ecs: ["ECS on Fargate", "애플리케이션 실행", "컨테이너 기반 배포와 오토스케일링으로 운영 유연성을 확보한다.", "Compute"],
          sqs: ["SQS", "비동기 큐", "메일, 알림, 외부 API 호출, 배치성 작업을 비동기로 분리한다.", "Integration"],
          ecr: ["ECR", "컨테이너 이미지 저장소", "ECS/EKS 기반 배포 시 이미지 저장소로 사용한다.", "DevOps"],
        },
        reasons: {
          security: "보안 강화 요구가 있으므로 IAM 최소 권한, WAF, Security Group, 로그 감사를 기본 설계에 포함한다.",
          awsInternal: "AWS → AWS 이행은 단순 복사보다 계정, 리전, 네트워크, IAM 권한 경계 설계가 먼저다.",
          serverMigration: "서버 이행은 AWS Application Migration Service로 먼저 옮긴 뒤, 안정화 후 현대화하는 접근이 현실적이다.",
          dbMigration: (source: string, target: string, method: string) => `DB 마이그레이션은 ${source} → ${target} 전환 기준으로 ${method} 방식을 우선 검토한다.`,
          methodCost: (method: string) => `${method}도 실제 AWS 서비스/이행 구성요소이므로 추천 구조와 비용 항목에 포함한다.`,
          dbMethod: "AWS 내부 Aurora/RDS 계열 이전은 스냅샷/백업 복원이 단순할 수 있고, 이기종 DB·무중단 요구가 있으면 DMS + SCT가 더 적합하다.",
          fileMigration: "파일/덤프/로그 이관은 DMS보다 DataSync와 S3 스테이징 구성이 더 적합하다.",
          static: "정적 웹사이트는 EC2 없이 S3 + CloudFront로 구성하면 비용과 운영 부담이 낮다.",
          analytics: "분석 워크로드는 원천 저장소(S3), 정제(Glue), 조회(Athena/Redshift)를 분리하는 편이 유지보수에 유리하다.",
          storage: "파일 저장/백업은 S3 Standard, IA, Glacier 계층을 수명주기 정책으로 자동 전환하는 방식이 적합하다.",
          serverless: "서버 관리 최소화 요구가 있으므로 EC2/ECS보다 API Gateway + Lambda + DynamoDB 구성이 적합하다.",
          web: "일반 웹/API 시스템은 Route 53 → CloudFront → ALB → App → DB 흐름이 기본 골격이다.",
          sqs: "트래픽 증가 시 동기 처리만으로는 병목이 생기므로 SQS로 느린 작업을 분리한다.",
          automation: "운영 자동화 요구가 있으므로 CI/CD 파이프라인과 이미지 저장소를 설계에 포함한다.",
          lowCost: "비용 최소화 요구가 있으므로 초기에는 관리형 서비스의 최소 구성과 사용량 기반 서비스를 우선 고려한다.",
          ha: "고가용성 요구가 있으므로 Multi-AZ, Health Check, Auto Scaling, 관리형 DB 구성을 우선한다.",
        },
        risks: {
          lift: "Lift & Shift는 빠르지만 운영 방식까지 그대로 옮겨 비용 최적화 효과가 작을 수 있다.",
          db: "DB 마이그레이션은 소스/대상 엔진, 스키마 호환성, 데이터 정합성, 컷오버 시간, 롤백 계획을 같이 봐야 한다.",
          nosql: "NoSQL 또는 문서형 DB가 포함되면 단순 이전보다 데이터 모델과 애플리케이션 쿼리 패턴 재설계가 필요할 수 있다.",
          commercialDb: "Oracle/SQL Server에서 오픈소스 DB로 바꾸면 프로시저, 함수, 시퀀스, 날짜 처리, 문자셋 호환성 이슈가 자주 나온다.",
          cutover: "컷오버 계획, 롤백 절차, 데이터 정합성 검증 쿼리, 성능 기준선을 사전에 문서화해야 한다.",
          large: "대용량 이행은 네트워크 대역폭, 컷오버 시간, 증분 복제 지연을 반드시 계산해야 한다.",
          static: "S3 버킷을 public으로 열기보다 CloudFront OAC/OAI를 통해 접근 제어하는 편이 안전하다.",
          athena: "Athena 비용은 쿼리 스캔 데이터량에 민감하므로 Parquet 변환과 파티셔닝을 고려해야 한다.",
          backup: "백업은 저장만으로 끝이 아니라 복구 테스트를 정기적으로 해야 한다.",
          lowCost: "비용 최소화만 우선하면 Multi-AZ, 백업, 모니터링이 약해져 장애 대응력이 떨어질 수 있다.",
          ha: "고가용성 구성은 비용이 증가한다. RTO/RPO 요구사항을 먼저 정해야 과설계를 피할 수 있다.",
          license: "상용 DB는 라이선스 비용과 BYOL 조건을 확인해야 한다. 단순 인프라 비용보다 라이선스가 더 클 수 있다.",
          over10tb: "10TB 이상 데이터는 온라인 이행만 고집하지 말고 Snowball, Direct Connect, 단계적 이행을 검토해야 한다.",
          default: "정확한 산정에는 리전, 인스턴스 타입, 트래픽 패턴, 데이터 전송량, 백업 보관 기간이 필요하다.",
        },
      };
}

type NodeKey = keyof ReturnType<typeof t>["nodes"];
function node(key: NodeKey, language: Language, override?: Partial<ArchitectureNode>): ArchitectureNode {
  const n = t(language).nodes[key];
  return { id: key, name: n[0], desc: n[1], reason: n[2], category: n[3], ...override };
}

function pushUnique(nodes: ArchitectureNode[], item: ArchitectureNode): void {
  if (!nodes.some((node) => node.name === item.name)) nodes.push(item);
}

function cost(name: string, monthly: number, note: string, category: CostCategory): CostItem {
  return { name, monthly, note, category };
}

function mergeDuplicateCostItems(items: CostItem[]): CostItem[] {
  const merged = new Map<string, CostItem>();
  for (const item of items) {
    const key = `${item.name}::${item.category}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...item });
      continue;
    }
    merged.set(key, {
      ...existing,
      monthly: Math.max(existing.monthly, item.monthly),
      note: existing.note === item.note ? existing.note : `${existing.note} / ${item.note}`,
    });
  }
  return Array.from(merged.values());
}

function getPricingConfig(config: ProjectConfig) {
  const method = getResolvedMigrationMethod(config);
  return {
    region: "ap-northeast-1" as const,
    dataSizeGb: getDataSizeGb(config.dataSize),
    migrationDays: config.dataSize === "over10tb" ? 14 : config.dataSize === "1tb" ? 7 : 3,
    useDms: method === "dms",
    useSnapshot: method === "snapshot",
    useBackup: method === "backupRestore" || method === "snapshot",
    useDataSync: method === "datasync" || config.workloadType === "fileMigration" || config.workloadType === "dataMigration",
    useS3Staging: method === "dumpRestore" || method === "datasync",
  };
}

function getDbNode(databaseType: DatabaseType, config: ProjectConfig, language: Language): ArchitectureNode {
  const label = getDatabaseLabel(databaseType, language);
  if (databaseType === "auroraMysql") return { id: "aurora", name: "Aurora MySQL", desc: language === "ja" ? "高可用性リレーショナルDB" : "고가용성 관계형 DB", reason: language === "ja" ? "MySQL互換性とマネージド高可用性を両立できます。" : "MySQL 호환성과 관리형 고가용성 구성이 필요한 대상 DB로 적합하다.", category: "Database" };
  if (databaseType === "auroraPostgresql") return { id: "aurora", name: "Aurora PostgreSQL", desc: language === "ja" ? "高可用性リレーショナルDB" : "고가용성 관계형 DB", reason: language === "ja" ? "PostgreSQL互換性とマネージド高可用性を両立できます。" : "PostgreSQL 호환성과 관리형 고가용성 구성이 필요한 대상 DB로 적합하다.", category: "Database" };
  if (databaseType === "dynamodb") return node("dynamodb", language);
  if (databaseType === "documentdb" || databaseType === "mongodb") return { id: "dynamodb", name: databaseType === "mongodb" ? "DynamoDB or DocumentDB" : "Amazon DocumentDB", desc: language === "ja" ? "NoSQLデータストア" : "NoSQL 데이터 저장소", reason: language === "ja" ? "MongoDB互換性またはDynamoDBへの再設計を検討します。" : "MongoDB 계열 워크로드라면 DocumentDB 호환성 또는 DynamoDB 재설계를 검토한다.", category: "Database" };
  if (hasRequirement(config, "highAvailability") || getTrafficLevel(config.users) >= 3) {
    return { id: "aurora", name: databaseType === "mysql" ? "Aurora MySQL" : "Aurora PostgreSQL", desc: language === "ja" ? "高可用性リレーショナルDB" : "고가용성 관계형 DB", reason: language === "ja" ? "Read Scaling、Multi-AZ、障害復旧、運用負荷削減を考慮したマネージドDBです。" : "읽기 확장, Multi-AZ, 장애 복구, 운영 부담 감소를 고려한 관리형 DB 선택이다.", category: "Database" };
  }
  return { id: "rds", name: databaseType === "none" || databaseType === "unknown" ? "Amazon RDS" : `Amazon RDS for ${label}`, desc: language === "ja" ? "マネージドリレーショナルDB" : "관리형 관계형 DB", reason: language === "ja" ? "初期/中規模ではDBサーバー直接運用よりバックアップ、パッチ、監視負荷を抑えられます。" : "초기/중간 규모 시스템에서는 직접 DB 서버 운영보다 백업, 패치, 모니터링 부담이 낮다.", category: "Database" };
}

function getMigrationNodes(config: ProjectConfig, language: Language): ArchitectureNode[] {
  const method = getResolvedMigrationMethod(config);
  if (method === "snapshot") return [node("snapshot", language), node("backup", language)];
  if (method === "dumpRestore") return [node("s3Migration", language, { id: "s3" }), { ...node("snapshot", language), id: "rds", name: "Native Dump/Restore", desc: language === "ja" ? "DBエンジン標準ツール" : "DB 엔진 기본 도구" }];
  if (method === "backupRestore") return [node("backup", language), node("snapshot", language)];
  if (method === "datasync") return [node("datasync", language), node("s3Migration", language, { id: "s3" })];
  if (method === "replication") return [{ id: "replication", name: language === "ja" ? "Native Replication" : "Native Replication", desc: language === "ja" ? "エンジン別レプリケーション" : "엔진별 복제", reason: language === "ja" ? "超大容量または特殊エンジンでは、binlog、logical replication、read replicaなどのネイティブ複製を検討します。" : "초대용량 또는 특수 엔진에서는 binlog, logical replication, read replica 같은 네이티브 복제를 검토한다.", category: "Migration" }, { id: "cloudwatch", name: "Replication Lag Monitoring", desc: language === "ja" ? "レプリケーション遅延監視" : "복제 지연 감시", reason: language === "ja" ? "カットオーバー前に複製遅延とデータ整合性を確認します。" : "컷오버 전에 복제 지연과 데이터 정합성을 확인해야 한다.", category: "Monitoring" }];
  return [node("dms", language), node("sct", language)];
}

export function createRecommendation(config: ProjectConfig, pricingRates: PricingRates = getLocalPricingRates("ap-northeast-1"), language: Language = "ko"): RecommendationResult {
  const text = t(language);
  const nodes: ArchitectureNode[] = [];
  const costItems: CostItem[] = [];
  const reasons: string[] = [];
  const risks: string[] = [];
  const trafficLevel = getTrafficLevel(config.users);
  const dataSizeMultiplier = getDataSizeMultiplier(config.dataSize);
  const riskBadges: RiskBadge[] = [];
  const finalResolvedMethod = getResolvedMigrationMethod(config);
  const isDmsMigration = finalResolvedMethod === "dms";
  const isLargeDataSize = config.dataSize === "1tb" || config.dataSize === "over10tb";
  const isVeryLargeDataSize = config.dataSize === "over10tb";

  const isMigration =
    config.projectType === "onpremToAws" ||
    config.projectType === "awsToAws" ||
    config.projectType === "databaseMigration" ||
    ["dataMigration", "dbMigration", "serverMigration", "fileMigration", "liftAndShift", "accountRegionMigration"].includes(config.workloadType);

  const isAnalytics = config.projectType === "analyticsPlatform" || config.workloadType === "analytics";
  const isStatic = config.projectType === "staticWebsite";
  const isServerless = config.projectType === "serverlessSystem" || hasRequirement(config, "lessOps");
  const isStorage = config.projectType === "backupStorage" || config.workloadType === "fileStorage";

  let title = text.baseTitle;
  let summary = text.baseSummary;

  pushUnique(nodes, node("iam", language));

  if (hasRequirement(config, "security")) {
    pushUnique(nodes, node("waf", language));
    costItems.push(cost("AWS WAF", trafficLevel >= 3 ? 45 : 15, language === "ja" ? "Web ACL + Rule + リクエスト数基準の概算" : "Web ACL + Rule + 요청 수 기준 러프 추정", "security"));
    reasons.push(text.reasons.security);
  }

  if (isMigration) {
    const hasDatabaseRoute = isConfiguredDatabase(config.sourceDatabaseType) && isConfiguredDatabase(config.targetDatabaseType);
    const isAwsInternalMove = config.projectType === "awsToAws" || config.workloadType === "accountRegionMigration";
    const isDbMigration =
      config.projectType === "databaseMigration" ||
      config.workloadType === "dbMigration" ||
      config.workloadType === "liftAndShift" ||
      (isAwsInternalMove && hasDatabaseRoute && config.workloadType !== "fileMigration" && config.workloadType !== "dataMigration");
    const isServerMigration = config.workloadType === "serverMigration" || config.workloadType === "liftAndShift";
    const isFileMigration = config.workloadType === "fileMigration" || config.workloadType === "dataMigration" || config.workloadType === "liftAndShift";

    title = isDbMigration && !isServerMigration && !isFileMigration ? text.dbMigrationTitle : text.migrationTitle;
    summary = isDbMigration ? text.dbMigrationSummary : text.migrationSummary;

    if (config.currentEnvironment === "onprem" || config.currentEnvironment === "localServer") {
      pushUnique(nodes, dataSizeMultiplier >= 5 ? node("directConnect", language) : node("vpn", language));
    }

    pushUnique(nodes, node("migrationHub", language));

    if (isAwsInternalMove) {
      pushUnique(nodes, node("organizations", language, { id: "iam" }));
      reasons.push(text.reasons.awsInternal);
    }

    if (isServerMigration) {
      pushUnique(nodes, node("mgn", language));
      pushUnique(nodes, node("ec2Target", language, { id: "ec2" }));
      costItems.push(cost("Application Migration Service", 180 * dataSizeMultiplier, language === "ja" ? "レプリケーションサーバー/移行期間基準の概算" : "복제 서버/이행 기간 기준 러프 추정", "migration"));
      reasons.push(text.reasons.serverMigration);
      risks.push(text.risks.lift);
    }

    if (isDbMigration) {
      const resolvedMethod = getResolvedMigrationMethod(config);
      const methodLabel = getMigrationMethodLabel(resolvedMethod, language);
      const sourceLabel = getDatabaseLabel(config.sourceDatabaseType, language);
      const targetLabel = getDatabaseLabel(config.targetDatabaseType, language);
      getMigrationNodes(config, language).forEach((item) => pushUnique(nodes, item));
      if (config.targetDatabaseType !== "none") pushUnique(nodes, getDbNode(config.targetDatabaseType, config, language));
      else if (config.databaseType !== "none") pushUnique(nodes, getDbNode(config.databaseType, config, language));

      buildMigrationPricingItems({...getPricingConfig(config), lang: language}).forEach((item) => costItems.push(item as CostItem));
      costItems.push(cost(targetLabel === (language === "ja" ? "なし" : "없음") ? "Target DB" : targetLabel, trafficLevel === 1 ? 80 : trafficLevel === 2 ? 180 : trafficLevel === 3 ? 700 : 1800, language === "ja" ? "移行先DBインスタンス + ストレージ概算" : "대상 DB 인스턴스 + 스토리지 러프 추정", "database"));
      reasons.push(text.reasons.dbMigration(sourceLabel, targetLabel, methodLabel));
      reasons.push(text.reasons.methodCost(methodLabel));
      reasons.push(text.reasons.dbMethod);
      risks.push(text.risks.db);
      if (!isRelationalDatabase(config.sourceDatabaseType) || !isRelationalDatabase(config.targetDatabaseType)) risks.push(text.risks.nosql);
      if (config.sourceDatabaseType === "oracle" || config.sourceDatabaseType === "sqlserver") risks.push(text.risks.commercialDb);
    }

    if (isFileMigration) {
      pushUnique(nodes, node("datasync", language));
      pushUnique(nodes, node("s3Migration", language, { id: "s3" }));
      if (config.dataSize === "over10tb") pushUnique(nodes, node("snowball", language));
      costItems.push(cost("DataSync", 70 * dataSizeMultiplier, language === "ja" ? "転送データ量基準の概算" : "전송 데이터량 기준 러프 추정", "migration"));
      costItems.push(cost("S3", 5 * dataSizeMultiplier, language === "ja" ? "移行ファイル/バックアップ保存容量基準" : "이행 파일/백업 저장 용량 기준", "storage"));
      reasons.push(text.reasons.fileMigration);
    }

    pushUnique(nodes, node("cloudwatch", language));
    costItems.push(cost("CloudWatch", 10 * dataSizeMultiplier, language === "ja" ? "ログ/メトリクス保存基準" : "로그/메트릭 보관 기준", "monitoring"));
    risks.push(text.risks.cutover);
    if (dataSizeMultiplier >= 5) risks.push(text.risks.large);
  }

  if (isStatic) {
    title = text.staticTitle;
    summary = text.staticSummary;
    pushUnique(nodes, node("route53", language));
    pushUnique(nodes, node("cloudfront", language));
    pushUnique(nodes, node("s3Static", language, { id: "s3" }));
    pushUnique(nodes, node("codepipeline", language));
    costItems.push(cost("S3", 3 * dataSizeMultiplier, language === "ja" ? "静的ファイル保存容量基準" : "정적 파일 저장 용량 기준", "storage"));
    costItems.push(cost("CloudFront", Math.max(5, Math.round(config.users * 0.005)), language === "ja" ? "ユーザー数ベースのデータ転送概算" : "사용자 수 기반 데이터 전송 러프 추정", "network"));
    reasons.push(text.reasons.static);
    risks.push(text.risks.static);
  }

  if (isAnalytics) {
    title = text.analyticsTitle;
    summary = text.analyticsSummary;
    pushUnique(nodes, node("s3Lake", language, { id: "s3" }));
    pushUnique(nodes, node("glue", language));
    pushUnique(nodes, node("athena", language));
    if (config.dataSize === "over10tb" || hasRequirement(config, "scalability")) {
      pushUnique(nodes, node("redshift", language));
      costItems.push(cost("Redshift", 900, language === "ja" ? "分析クラスター最小構成の概算" : "분석 클러스터 최소 구성 러프 추정", "analytics"));
    }
    costItems.push(cost("S3 Data Lake", 8 * dataSizeMultiplier, language === "ja" ? "データ保存容量基準" : "데이터 저장 용량 기준", "storage"));
    costItems.push(cost("Glue", 40 * dataSizeMultiplier, language === "ja" ? "ETL Job実行量基準" : "ETL Job 실행량 기준", "analytics"));
    costItems.push(cost("Athena", 20 * dataSizeMultiplier, language === "ja" ? "スキャンデータ量基準" : "스캔 데이터량 기준", "analytics"));
    reasons.push(text.reasons.analytics);
    risks.push(text.risks.athena);
  }

  if (isStorage) {
    title = text.storageTitle;
    summary = text.storageSummary;
    pushUnique(nodes, node("s3", language));
    pushUnique(nodes, node("backup", language));
    pushUnique(nodes, node("cloudwatch", language));
    costItems.push(cost("S3", 10 * dataSizeMultiplier, language === "ja" ? "ファイル保存容量基準" : "파일 저장 용량 기준", "storage"));
    costItems.push(cost("AWS Backup", 15 * dataSizeMultiplier, language === "ja" ? "バックアップ保存容量基準" : "백업 보관 용량 기준", "storage"));
    reasons.push(text.reasons.storage);
    risks.push(text.risks.backup);
  }

  if (!isMigration && !isAnalytics && !isStatic && !isStorage) {
    title = isServerless ? text.serverlessTitle : text.newSystemTitle;
    summary = isServerless ? text.serverlessSummary : text.newSystemSummary;
    pushUnique(nodes, node("users", language, { id: "users", desc: text.usersDesc(config.users) }));
    pushUnique(nodes, node("route53", language));
    pushUnique(nodes, node("cloudfront", language));

    if (isServerless) {
      pushUnique(nodes, node("apiGateway", language));
      pushUnique(nodes, node("lambda", language));
      pushUnique(nodes, node("dynamodb", language));
      costItems.push(cost("API Gateway", Math.max(5, Math.round(config.users * 0.01)), language === "ja" ? "リクエスト数基準の概算" : "요청 수 기반 러프 추정", "serverless"));
      costItems.push(cost("Lambda", Math.max(5, Math.round(config.users * 0.008)), language === "ja" ? "呼び出し数/実行時間基準の概算" : "호출 수/실행 시간 기반 러프 추정", "serverless"));
      costItems.push(cost("DynamoDB", Math.max(10, Math.round(config.users * 0.012)), language === "ja" ? "読み書きリクエスト量基準の概算" : "읽기/쓰기 요청량 기반 러프 추정", "database"));
      reasons.push(text.reasons.serverless);
    } else {
      pushUnique(nodes, node("alb", language));
      pushUnique(nodes, trafficLevel >= 3 ? node("ecs", language) : node("app", language, { id: "ec2" }));
      pushUnique(nodes, getDbNode(config.databaseType, config, language));
      costItems.push(cost("ALB", trafficLevel >= 3 ? 60 : 25, language === "ja" ? "ロードバランサー時間 + LCU概算" : "로드밸런서 시간 + LCU 러프 추정", "network"));
      costItems.push(cost(trafficLevel >= 3 ? "ECS Fargate" : `EC2 ${pricingRates.ec2.selected.label}`, trafficLevel >= 3 ? (trafficLevel === 3 ? 600 : 1600) : pricingRates.ec2.selected.monthly, trafficLevel >= 3 ? (language === "ja" ? "コンテナ実行費用の概算" : "컨테이너 실행 비용 러프 추정") : `${pricingRates.region} · ${pricingRates.ec2.selected.hourly.toFixed(4)} USD/hour × 730${language === "ja" ? "時間基準のローカル概算" : "시간 기준 로컬 추정"}`, "compute"));
      costItems.push(cost(hasRequirement(config, "highAvailability") || trafficLevel >= 3 ? "Aurora" : "RDS", trafficLevel === 1 ? 80 : trafficLevel === 2 ? 180 : trafficLevel === 3 ? 700 : 1800, language === "ja" ? "DBインスタンス + ストレージ + Multi-AZ概算" : "DB 인스턴스 + 스토리지 + Multi-AZ 러프 추정", "database"));
      reasons.push(text.reasons.web);
    }

    if (trafficLevel >= 3 || hasRequirement(config, "scalability")) {
      pushUnique(nodes, node("sqs", language));
      costItems.push(cost("SQS", Math.max(5, Math.round(config.users * 0.002)), language === "ja" ? "メッセージリクエスト数基準" : "메시지 요청 수 기준", "serverless"));
      reasons.push(text.reasons.sqs);
    }
  }

  if (hasRequirement(config, "automation")) {
    pushUnique(nodes, node("codepipeline", language));
    pushUnique(nodes, node("ecr", language));
    costItems.push(cost("CI/CD", 20, language === "ja" ? "小規模ビルド実行量基準" : "소규모 빌드 실행량 기준", "compute"));
    reasons.push(text.reasons.automation);
  }

  pushUnique(nodes, node("cloudwatch", language));
  costItems.push(cost("CloudWatch", Math.max(10, 10 * dataSizeMultiplier), language === "ja" ? "ログ保存量/メトリクス/アラーム基準" : "로그 저장량/메트릭/알람 기준", "monitoring"));

  if (nodes.some((item) => item.id === "cloudfront")) {
    costItems.push(cost("CloudFront", Math.max(8, Math.round(config.users * 0.006)), language === "ja" ? "データ転送量ベースの概算" : "데이터 전송량 기반 러프 추정", "network"));
  }

  const hasS3 = nodes.some((item) => item.id === "s3");
  if (hasS3 && !costItems.some((item) => item.name.includes("S3"))) {
    costItems.push(cost("S3", 8 * dataSizeMultiplier, language === "ja" ? "保存容量/リクエスト数基準" : "저장 용량/요청 수 기준", "storage"));
  }

  if (hasRequirement(config, "lowCost")) {
    reasons.push(text.reasons.lowCost);
    risks.push(text.risks.lowCost);
  }

  if (hasRequirement(config, "highAvailability")) {
    reasons.push(text.reasons.ha);
    risks.push(text.risks.ha);
  }

  if (config.databaseType === "oracle" || config.databaseType === "sqlserver") risks.push(text.risks.license);
  if (config.dataSize === "over10tb") risks.push(text.risks.over10tb);
  if (risks.length === 0) risks.push(text.risks.default);

  const normalizedCostItems = mergeDuplicateCostItems(costItems);
  const totalMonthlyCost = normalizedCostItems.reduce((sum, item) => sum + item.monthly, 0);

  if (totalMonthlyCost >= 1000) {
    riskBadges.push({
      label: language === "ja" ? "HIGH MONTHLY COST" : "월 예상 비용 높음",
      level: "danger",
    });
  }

  if (isDmsMigration && isLargeDataSize) {
    riskBadges.push({
      label: language === "ja" ? "LONG RUNNING DMS" : "장시간 DMS 예상",
      level: "warning",
    });
  }

  if (isLargeDataSize) {
    riskBadges.push({
      label: language === "ja" ? "LARGE DATA TRANSFER" : "대용량 데이터 전송",
      level: "warning",
    });
  }

  if (isVeryLargeDataSize) {
    riskBadges.push({
      label: language === "ja" ? "OVER 10TB DATA" : "10TB 이상 데이터",
      level: "danger",
    });
  }

  return {
    title,
    summary,
    nodes,
    costItems: normalizedCostItems,
    reasons,
    risks,
    riskBadges,
    totalMonthlyCost,
    pricingSource: pricingRates.source,
    pricingRegion: pricingRates.region,
  };
}
