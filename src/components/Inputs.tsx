import { requirements, userPresets } from "../constants";
import { getLocalizedUserPresets, localizeOptions, optionText, uiText } from "../i18n";
import type { Language } from "../i18n";
import type { Requirement, SelectOption } from "../types";
import { normalizeUserInput } from "../utils";
import { Card } from "./common";

export function SelectGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  disabled = false,
  helperText,
}: {
  title: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  helperText?: string;
}) {
  return (
    <Card>
      <div className="card-body">
        <div className="input-title">{title}</div>
        {helperText ? <p className="input-helper">{helperText}</p> : null}
        <div className="option-list">
          {options.map((option) => {
            const active = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                className={`option-button ${active ? "option-button-active" : ""}`}
                onClick={() => onChange(option.id)}
              >
                <div className="option-label">{option.label}</div>
                {option.description ? (
                  <div className={`option-description ${active ? "option-description-active" : ""}`}>{option.description}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export function UserCountSelector({ users, onChange, language = "ja" }: { users: number; onChange: (users: number) => void; language?: Language }) {
  const text = uiText[language];
  const localizedPresets = getLocalizedUserPresets(language, userPresets);

  return (
    <Card>
      <div className="card-body">
        <div className="user-selector-header">
          <div>
            <label htmlFor="users" className="input-title">
              {text.userCountTitle}
            </label>
            <p className="input-helper compact">{text.userCountHelp}</p>
          </div>
          <div className="user-count-badge">{users.toLocaleString()}{text.people}</div>
        </div>

        <div className="user-preset-grid">
          {localizedPresets.map((preset) => {
            const active = users === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                className={`user-preset-button ${active ? "user-preset-button-active" : ""}`}
                onClick={() => onChange(preset.value)}
              >
                <div className="user-preset-label">{preset.label}</div>
                <div className={`user-preset-description ${active ? "user-preset-description-active" : ""}`}>{preset.description}</div>
                <div className={`user-preset-detail ${active ? "user-preset-detail-active" : ""}`}>{preset.detail}</div>
              </button>
            );
          })}
        </div>

        <div className="direct-input-block">
          <label htmlFor="users" className="direct-input-label">
            {text.directInput}
          </label>
          <div className="direct-input-shell">
            <input
              id="users"
              type="text"
              inputMode="numeric"
              value={users.toLocaleString()}
              onChange={(event) => onChange(normalizeUserInput(event.target.value))}
              className="direct-input"
              placeholder={text.userPlaceholder}
            />
            <span className="direct-input-suffix">{text.peopleOrMore}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function RequirementSelector({ selected, onToggle, language = "ja" }: { selected: Requirement[]; onToggle: (requirement: Requirement) => void; language?: Language }) {
  const text = uiText[language];
  const localizedRequirements = localizeOptions(requirements, optionText[language].requirements);

  return (
    <Card>
      <div className="card-body">
        <div className="input-title">{text.requirementTitle}</div>
        <div className="requirement-list">
          {localizedRequirements.map((requirement) => {
            const active = selected.includes(requirement.id);
            return (
              <button
                key={requirement.id}
                type="button"
                className={`requirement-button ${active ? "requirement-button-active" : ""}`}
                onClick={() => onToggle(requirement.id)}
              >
                {requirement.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
