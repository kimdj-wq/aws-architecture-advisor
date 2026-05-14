import type { ReactNode } from "react";
import { iconMap } from "../constants";
import { uiText } from "../i18n";
import type { Language } from "../i18n";
import type { ArchitectureNode, RecommendationResult } from "../types";
import { Card } from "./common";

export function ArchitectureFlow({ nodes }: { nodes: ArchitectureNode[] }) {
  return (
    <div className="architecture-board">
      <div className="architecture-board-header">
        <div>
          <h2 className="panel-title">Architecture Flow</h2>
          <p className="panel-helper">Selected AWS components and their roles</p>
        </div>
        <span className="architecture-count">{nodes.length} components</span>
      </div>

      <div className="architecture-grid">
        {nodes.map((node, index) => (
          <div key={`${node.name}-${index}`} className="architecture-card">
            <div className="architecture-card-top">
              <div className="architecture-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="architecture-node-icon">{iconMap[node.id] ?? "🧩"}</div>
            </div>

            <div className="architecture-node-header">
              <h3 className="architecture-node-title">{node.name}</h3>
              <span className="architecture-node-category">{node.category}</span>
            </div>

            <div className="architecture-node-desc">{node.desc}</div>
            <p className="architecture-node-reason">{node.reason}</p>

            {index < nodes.length - 1 ? <div className="architecture-connector">→</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CostView({ result, language = "ja" }: { result: RecommendationResult; language?: Language; pricingStatus?: "loading" | "api" | "fallback" }) {
  const text = uiText[language];
  const maxMonthly = Math.max(...result.costItems.map((item) => item.monthly), 1);
  const topItems = [...result.costItems].sort((a, b) => b.monthly - a.monthly).slice(0, 3);
  const getCostCategoryClass = (category: string) => {
    switch (category) {
      case "compute":
        return "cost-chart-fill-compute";
      case "database":
        return "cost-chart-fill-database";
      case "storage":
        return "cost-chart-fill-storage";
      case "network":
        return "cost-chart-fill-network";
      case "migration":
        return "cost-chart-fill-migration";
      default:
        return "cost-chart-fill-default";
    }
  };

  return (
    <Card>
      <div className="card-body">
        <div className="cost-header">
          <div>
            <h2 className="panel-title">{text.costTitle}</h2>
            <p className="panel-helper">{text.costHelp}</p>
          </div>
          <div className="cost-total-badge">{text.monthlyPrefix} ${result.totalMonthlyCost.toLocaleString()} {text.monthSuffix}</div>
        </div>

        <div className="cost-item-list">
          {result.costItems.map((item) => (
            <div key={`${item.name}-${item.category}`} className="cost-item">
              <div className="cost-item-header">
                <div>
                  <div className="cost-item-name">{item.name}</div>
                  <div className="cost-item-note">{item.note}</div>
                  {item.detail ? <div className="cost-item-detail">{item.detail}</div> : null}
                </div>
                <div className="cost-item-price">${item.monthly.toLocaleString()}</div>
              </div>
              <div className="cost-bar-track">
                <div className="cost-bar-fill" style={{ width: `${Math.max(4, (item.monthly / maxMonthly) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="cost-chart-box">
          <div className="top-cost-title">{language === "ja" ? "コスト構成比" : "비용 구성 비율"}</div>

          <div className="cost-chart-list">
            {result.costItems.map((item) => {
              const percent =
                result.totalMonthlyCost > 0
                  ? Math.round((item.monthly / result.totalMonthlyCost) * 100)
                  : 0;

              return (
                <div key={`chart-${item.name}-${item.category}`} className="cost-chart-row">
                  <div className="cost-chart-meta">
                    <span className="cost-chart-label">{item.name}</span>
                    <span className={`cost-category-badge cost-category-${item.category}`}>
                      {item.category}
                    </span>
                    <span className="cost-chart-percent">{percent}%</span>
                  </div>
                  <div className="cost-chart-track">
                    <div 
                      className={`cost-chart-fill ${getCostCategoryClass(item.category)}`} 
                      style={{ width: `${Math.max(percent, 3)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="top-cost-box">
          <div className="top-cost-title">{text.topCosts}</div>
          <div className="top-cost-list">
            {topItems.map((item, index) => (
              <div key={item.name} className="top-cost-row">
                <span>
                  {index + 1}. {item.name}
                </span>
                <strong>${item.monthly.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ListView({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "amber" }) {
  return (
    <Card>
      <div className="card-body">
        <h2 className="panel-title">{title}</h2>
        <div className="list-view-items">
          {items.map((item, index) => (
            <div key={`${item}-${index}`} className={`list-view-item ${tone === "blue" ? "list-view-item-blue" : "list-view-item-amber"}`}>
              <strong className="list-view-number">{index + 1}.</strong>
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function SummaryMetric({ label, value, helper }: { label: string; value: ReactNode; helper?: string }) {
  return (
    <div className="summary-metric">
      <div className="summary-metric-label">{label}</div>
      <div className="summary-metric-value">{value}</div>
      {helper ? <div className="summary-metric-helper">{helper}</div> : null}
    </div>
  );
}
