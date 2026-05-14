import { useMemo, useState } from "react";
import "./App.css";
import { dataSizes, databaseTypes, environments, migrationMethods, projectTypes } from "./constants";
import { RequirementSelector, SelectGroup, UserCountSelector } from "./components/Inputs";
import { ArchitectureFlow, CostView, ListView, SummaryMetric } from "./components/Results";
import { Card } from "./components/common";
import {
  createRecommendation,
  getAvailableWorkloadTypes,
  getEnvironmentHelperText,
  getMigrationMethodLabel,
  getProjectTypeDefaults,
  getResolvedMigrationMethod,
  getWorkloadHelperText,
  normalizeWorkloadForProject,
} from "./services/recommendation";
import type { ActiveTab, ProjectConfig, RecommendationResult, Requirement, ProjectType } from "./types";
import {
  getDmsFamilyOptions,
  getEc2FamilyOptions,
  getRdsFamilyOptions,
  getDmsInstanceOptions,
  getEc2InstanceOptions,
  getRdsInstanceOptions,
  getLocalPricingRates,
  regionOptions,
  type DmsInstanceFamily,
  type DmsInstanceKey,
  type Ec2InstanceFamily,
  type Ec2InstanceKey,
  type RdsInstanceFamily,
  type RdsInstanceKey,
  type PricingRegion,
} from "./awsPricing";
import { localizeOptions, optionText, uiText } from "./i18n";
import type { Language } from "./i18n";

export default function AwsArchitectureAdvisor() {
  const [lang, setLang] = useState<Language>("ja");
  const text = uiText[lang];
  const optionsText = optionText[lang];

  const [config, setConfig] = useState<ProjectConfig>({
    projectType: "onpremToAws",
    currentEnvironment: "onprem",
    workloadType: "liftAndShift",
    databaseType: "auroraPostgresql",
    sourceDatabaseType: "oracle",
    targetDatabaseType: "auroraPostgresql",
    migrationMethod: "auto",
    dataSize: "1tb",
    users: 10000,
    requirements: ["security", "fastMigration", "highAvailability"],
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("architecture");
  const [pricingRegion, setPricingRegion] = useState<PricingRegion>("ap-northeast-1");
  const [ec2Family, setEc2Family] = useState<Ec2InstanceFamily>("t3");
  const [ec2InstanceKey, setEc2InstanceKey] = useState<Ec2InstanceKey>("t3.micro");
  const [dmsFamily, setDmsFamily] = useState<DmsInstanceFamily>("dms.r5");
  const [dmsInstanceKey, setDmsInstanceKey] = useState<DmsInstanceKey>("dms.r5.large");
  const [rdsFamily, setRdsFamily] = useState<RdsInstanceFamily>("db.r5");
  const [rdsInstanceKey, setRdsInstanceKey] = useState<RdsInstanceKey>("db.r5.large");

  const localizedProjectTypes = useMemo(() => localizeOptions(projectTypes, optionsText.projectTypes), [optionsText.projectTypes]);
  const localizedEnvironments = useMemo(() => localizeOptions(environments, optionsText.environments), [optionsText.environments]);
  const localizedDatabaseTypes = useMemo(() => localizeOptions(databaseTypes, optionsText.databaseTypes), [optionsText.databaseTypes]);
  const localizedMigrationMethods = useMemo(() => localizeOptions(migrationMethods, optionsText.migrationMethods), [optionsText.migrationMethods]);
  const localizedDataSizes = useMemo(() => localizeOptions(dataSizes, optionsText.dataSizes), [optionsText.dataSizes]);
  const localizedRegions = useMemo(() => localizeOptions(regionOptions, optionsText.regions), [optionsText.regions]);

  const ec2InstanceOptions = useMemo(() => getEc2InstanceOptions(pricingRegion, ec2Family, lang), [pricingRegion, ec2Family, lang]);
  const dmsInstanceOptions = useMemo(() => getDmsInstanceOptions(pricingRegion, dmsFamily, lang), [pricingRegion, dmsFamily, lang]);
  const rdsInstanceOptions = useMemo(() => getRdsInstanceOptions(pricingRegion, rdsFamily, lang), [pricingRegion, rdsFamily, lang]);
  const pricingRates = useMemo(() => getLocalPricingRates(pricingRegion, ec2InstanceKey, dmsInstanceKey, rdsInstanceKey, lang), [pricingRegion, ec2InstanceKey, dmsInstanceKey, rdsInstanceKey, lang]);

  const handleEc2FamilyChange = (family: Ec2InstanceFamily) => {
    const nextOptions = getEc2InstanceOptions(pricingRegion, family, lang);
    const sameSize = nextOptions.find((item) => item.size === pricingRates.ec2.selected.size);
    const nextInstance = sameSize ?? nextOptions[0];

    setEc2Family(family);
    if (nextInstance) setEc2InstanceKey(nextInstance.key);
  };

  const handleDmsFamilyChange = (family: DmsInstanceFamily) => {
    const nextOptions = getDmsInstanceOptions(pricingRegion, family, lang);
    const sameSize = nextOptions.find((item) => item.size === pricingRates.dms.selected.size);
    const nextInstance = sameSize ?? nextOptions[0];

    setDmsFamily(family);
    if (nextInstance) setDmsInstanceKey(nextInstance.key);
  };

  const handleRdsFamilyChange = (family: RdsInstanceFamily) => {
    const nextOptions = getRdsInstanceOptions(pricingRegion, family, lang);
    const sameSize = nextOptions.find((item) => item.size === pricingRates.rds.selected.size);
    const nextInstance = sameSize ?? nextOptions[0];

    setRdsFamily(family);
    if (nextInstance) setRdsInstanceKey(nextInstance.key);
  };

  const result = useMemo<RecommendationResult>(() => createRecommendation(config, pricingRates, lang), [config, pricingRates, lang]);

  const updateConfig = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleProjectTypeChange = (projectType: ProjectType) => {
    setConfig((prev) => {
      const defaults = getProjectTypeDefaults(projectType);
      return {
        ...prev,
        projectType,
        ...defaults,
        workloadType: normalizeWorkloadForProject(projectType, defaults.workloadType ?? prev.workloadType),
      };
    });
  };

  const availableWorkloads = useMemo(() => {
    return localizeOptions(getAvailableWorkloadTypes(config.projectType), optionsText.workloadTypes);
  }, [config.projectType, optionsText.workloadTypes]);

  const isCurrentEnvironmentLocked = config.projectType === "onpremToAws" || config.projectType === "awsToAws";
  const isWorkloadLocked = false;
  const showsMigrationDetails =
    config.projectType === "databaseMigration" ||
    config.workloadType === "dbMigration" ||
    config.workloadType === "dataMigration" ||
    config.workloadType === "fileMigration" ||
    config.workloadType === "accountRegionMigration" ||
    config.workloadType === "liftAndShift";
  const resolvedMigrationMethod = getResolvedMigrationMethod(config);
  const showsDmsSizing = showsMigrationDetails && resolvedMigrationMethod === "dms";
  const showsRdsSizing = showsMigrationDetails && ["snapshot", "backupRestore", "dumpRestore"].includes(resolvedMigrationMethod);

  const selectedDataSizeLabel = localizedDataSizes.find((item) => item.id === config.dataSize)?.label;

  const toggleRequirement = (requirement: Requirement) => {
    setConfig((prev) => {
      const exists = prev.requirements.includes(requirement);
      return {
        ...prev,
        requirements: exists ? prev.requirements.filter((item) => item !== requirement) : [...prev.requirements, requirement],
      };
    });
  };

  const ec2FamilyOptions = useMemo(() => getEc2FamilyOptions(lang), [lang]);
  const dmsFamilyOptions = useMemo(() => getDmsFamilyOptions(lang), [lang]);
  const rdsFamilyOptions = useMemo(() => getRdsFamilyOptions(lang), [lang]);

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="app-header-top">
            <div className="app-badge">{text.appBadge}</div>
            <div className="language-toggle" aria-label={text.languageLabel}>
              <button
                type="button"
                className={`language-toggle-button ${lang === "ja" ? "active" : ""}`}
                onClick={() => setLang("ja")}
              >
                {text.ja}
              </button>
              <button
                type="button"
                className={`language-toggle-button ${lang === "ko" ? "active" : ""}`}
                onClick={() => setLang("ko")}
              >
                {text.ko}
              </button>
            </div>
          </div>
          <h1 className="app-title">{text.appTitle}</h1>
          <p className="app-description">{text.appDescription}</p>
        </header>

        <div className="top-input-grid">
          <UserCountSelector users={config.users} onChange={(users) => updateConfig("users", users)} language={lang} />
          <RequirementSelector selected={config.requirements} onToggle={toggleRequirement} language={lang} />
        </div>

        <div className="app-layout">
          <aside className="stack-5">
            <SelectGroup title={text.projectType} options={localizedProjectTypes} value={config.projectType} onChange={handleProjectTypeChange} />
            <SelectGroup
              title={text.currentEnvironment}
              options={localizedEnvironments}
              value={config.currentEnvironment}
              onChange={(value) => updateConfig("currentEnvironment", value)}
              disabled={isCurrentEnvironmentLocked}
              helperText={getEnvironmentHelperText(config.projectType, lang)}
            />
            <SelectGroup
              title={text.workloadType}
              options={availableWorkloads}
              value={normalizeWorkloadForProject(config.projectType, config.workloadType)}
              onChange={(value) => updateConfig("workloadType", value)}
              disabled={isWorkloadLocked}
              helperText={getWorkloadHelperText(config.projectType, lang)}
            />
            {showsMigrationDetails ? (
              <>
                <SelectGroup
                  title={text.sourceDatabase}
                  options={localizedDatabaseTypes}
                  value={config.sourceDatabaseType}
                  onChange={(value) => updateConfig("sourceDatabaseType", value)}
                  helperText={text.sourceDbHelp}
                />
                <SelectGroup
                  title={text.targetDatabase}
                  options={localizedDatabaseTypes}
                  value={config.targetDatabaseType}
                  onChange={(value) => {
                    updateConfig("targetDatabaseType", value);
                    updateConfig("databaseType", value);
                  }}
                  helperText={text.targetDbHelp}
                />
                <SelectGroup
                  title={text.migrationMethod}
                  options={localizedMigrationMethods}
                  value={config.migrationMethod}
                  onChange={(value) => updateConfig("migrationMethod", value)}
                  helperText={text.migrationMethodHelp}
                />
              </>
            ) : (
              <SelectGroup title={text.database} options={localizedDatabaseTypes} value={config.databaseType} onChange={(value) => updateConfig("databaseType", value)} />
            )}
            <SelectGroup title={text.dataSize} options={localizedDataSizes} value={config.dataSize} onChange={(value) => updateConfig("dataSize", value)} />
            <SelectGroup
              title={text.pricingRegion}
              options={localizedRegions}
              value={pricingRegion}
              onChange={(value) => setPricingRegion(value)}
              helperText={text.pricingRegionHelp}
            />
            {showsDmsSizing ? (
              <Card>
                <div className="card-body">
                  <div className="section-title">{text.dmsSectionTitle}</div>
                  <p className="section-help">{text.dmsSectionHelp}</p>

                  <div className="form-stack">
                    <label className="form-field">
                      <span className="field-label">{text.dmsFamily}</span>
                      <select className="select-input" value={dmsFamily} onChange={(event) => handleDmsFamilyChange(event.target.value as DmsInstanceFamily)}>
                        {dmsFamilyOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <span className="field-help">{dmsFamilyOptions.find((item) => item.id === dmsFamily)?.label}</span>
                    </label>

                    <label className="form-field">
                      <span className="field-label">{text.dmsInstanceClass}</span>
                      <select className="select-input" value={dmsInstanceKey} onChange={(event) => setDmsInstanceKey(event.target.value as DmsInstanceKey)}>
                        {dmsInstanceOptions.map((instance) => (
                          <option key={instance.key} value={instance.key}>{instance.label} · ${instance.monthly}/month</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="pricing-box">
                    <div className="pricing-label">{text.selectedDmsRate}</div>
                    <div className="pricing-value">${pricingRates.dms.selected.monthly}{text.monthSuffix}</div>
                    <div className="section-help">
                      {pricingRates.dms.selected.label} · ${pricingRates.dms.selected.hourly.toFixed(4)}/hour · {pricingRates.region}
                      {pricingRates.dms.selected.vcpu ? ` · ${pricingRates.dms.selected.vcpu} vCPU / ${pricingRates.dms.selected.memoryGiB} GiB` : ""}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {showsRdsSizing ? (
              <Card>
                <div className="card-body">
                  <div className="section-title">{text.rdsSectionTitle}</div>
                  <p className="section-help">{text.rdsSectionHelp}</p>

                  <div className="form-stack">
                    <label className="form-field">
                      <span className="field-label">{text.dbFamily}</span>
                      <select className="select-input" value={rdsFamily} onChange={(event) => handleRdsFamilyChange(event.target.value as RdsInstanceFamily)}>
                        {rdsFamilyOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <span className="field-help">{rdsFamilyOptions.find((item) => item.id === rdsFamily)?.label}</span>
                    </label>

                    <label className="form-field">
                      <span className="field-label">{text.dbInstanceClass}</span>
                      <select className="select-input" value={rdsInstanceKey} onChange={(event) => setRdsInstanceKey(event.target.value as RdsInstanceKey)}>
                        {rdsInstanceOptions.map((instance) => (
                          <option key={instance.key} value={instance.key}>{instance.label} · ${instance.monthly}/month</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="pricing-box">
                    <div className="pricing-label">{text.selectedDbRate}</div>
                    <div className="pricing-value">${pricingRates.rds.selected.monthly}{text.monthSuffix}</div>
                    <div className="section-help">
                      {pricingRates.rds.selected.label} · ${pricingRates.rds.selected.hourly.toFixed(4)}/hour · {pricingRates.region}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {!showsMigrationDetails ? (
              <Card>
                <div className="card-body">
                  <div className="section-title">{text.ec2SectionTitle}</div>
                  <p className="section-help">{text.ec2SectionHelp}</p>

                  <div className="form-stack">
                    <label className="form-field">
                      <span className="field-label">{text.ec2Family}</span>
                      <select className="select-input" value={ec2Family} onChange={(event) => handleEc2FamilyChange(event.target.value as Ec2InstanceFamily)}>
                        {ec2FamilyOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      <span className="field-help">{ec2FamilyOptions.find((item) => item.id === ec2Family)?.label}</span>
                    </label>

                    <label className="form-field">
                      <span className="field-label">{text.ec2InstanceType}</span>
                      <select className="select-input" value={ec2InstanceKey} onChange={(event) => setEc2InstanceKey(event.target.value as Ec2InstanceKey)}>
                        {ec2InstanceOptions.map((instance) => (
                          <option key={instance.key} value={instance.key}>{instance.label} · ${instance.monthly}/month</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="pricing-box">
                    <div className="pricing-label">{text.selectedEc2Rate}</div>
                    <div className="pricing-value">${pricingRates.ec2.selected.monthly}{text.monthSuffix}</div>
                    <div className="section-help">
                      {pricingRates.ec2.selected.label} · ${pricingRates.ec2.selected.hourly.toFixed(4)}/hour · {pricingRates.region}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </aside>

          <main className="stack-5">
            <Card className="result-card">
              <div className="result-body">
                <div className="result-badge">{text.resultBadge}</div>
                <div className="result-title">{result.title}</div>
                <p className="result-summary">{result.summary}</p>
                <div className="summary-grid">
                  <SummaryMetric label={text.expectedUsers} value={`${config.users.toLocaleString()}${text.peoplePlus}`} helper={text.usersHelper} />
                  <SummaryMetric label={text.serviceCount} value={`${result.nodes.length}`} helper={text.servicesHelper} />
                  <SummaryMetric label={text.estimatedMonthlyCost} value={`$${result.totalMonthlyCost.toLocaleString()}`} helper={`${pricingRates.region} ${text.localPricingHelper}`} />
                  <SummaryMetric label={text.dataSize} value={selectedDataSizeLabel} helper={text.dataSizeHelper} />
                  {showsMigrationDetails ? <SummaryMetric label={text.migrationMethodMetric} value={getMigrationMethodLabel(getResolvedMigrationMethod(config), lang)} helper={text.migrationMethodHelper} /> : null}
                </div>
              </div>
            </Card>

            <Card>
              <div className="tabs-card-body">
                <div className="tabs-grid">
                  {[
                    { id: "architecture", label: text.tabs.architecture },
                    { id: "cost", label: text.tabs.cost },
                    { id: "reason", label: text.tabs.reason },
                    { id: "risk", label: text.tabs.risk },
                  ].map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`tab-button ${active ? "tab-button-active" : ""}`}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {activeTab === "architecture" ? <ArchitectureFlow nodes={result.nodes} /> : null}
            {activeTab === "cost" ? <CostView result={result} language={lang} /> : null}
            {activeTab === "reason" ? <ListView title={text.tabs.reason} items={result.reasons} tone="blue" /> : null}
            {activeTab === "risk" ? <ListView title={text.tabs.risk} items={result.risks} tone="amber" /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
