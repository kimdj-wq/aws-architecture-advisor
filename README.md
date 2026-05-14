# AWS Architecture Advisor

AWS Architecture Advisor is a React + TypeScript web application that recommends AWS architecture patterns and estimates rough monthly costs based on project conditions.

The tool is designed for early-stage architecture review and cost estimation without calling actual AWS APIs.

---

## Features

- AWS architecture recommendation based on project type and workload
- Rough monthly cost estimation using local static pricing data
- EC2 / RDS / DMS instance family selection
- DMS, Snapshot, Backup, S3 Staging, and DataSync cost estimation
- Cost breakdown with calculation details
- Cost visualization by service/category
- Japanese / Korean language toggle
- JSON export for estimation results
- No AWS API calls or cloud resource creation

---

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Local static pricing data

---

## Project Purpose

This project was created to support the initial review phase of AWS architecture planning.

It helps reduce the time required to compare AWS service options, understand rough cost impact, and explain architecture decisions with visible calculation details.

---

## Important Notes

This tool does not access AWS services and does not create any AWS resources.

All costs are rough estimates based on local static pricing data. Actual AWS billing may differ depending on region, usage, exchange rates, tax, free tier, data transfer, and service-specific pricing rules.

---

## Getting Started

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Main Modules

```txt
src/App.tsx
- Main UI, state management, language toggle, export handling

src/awsPricing.ts
- Local AWS pricing table and cost calculation helpers

src/services/recommendation.ts
- Architecture recommendation and cost item generation logic

src/i18n.ts
- Japanese / Korean UI text management

src/components/
- Input and result display components
```

---

## Current Scope

This application supports rough estimation and recommendation for:

- General AWS web/application workloads
- Database migration scenarios
- DMS-based migration
- Snapshot / backup / dump-based migration
- Storage and transfer cost estimation

---

## Future Improvements

- More accurate pricing data update workflow
- PDF export
- Dark mode
- Estimate history
- AWS Pricing API integration as an optional mode
- More detailed network cost estimation

---

## License

Internal / personal project.