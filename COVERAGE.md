# Test-case coverage map

Every TC ID from `Insurance_Order_Entry_Test_Cases.xlsx` maps to a Playwright test whose title starts with that ID (run one with `npx playwright test -g "AUTH-001"`).

'Automated' tests that depend on unsupplied business values (face-value limits, rider names, upload limit...) call `test.skip` with the reason until you set the value in `.env`.

| TC ID | Module | Priority | Status | Spec file |
|---|---|---|---|---|
| AUTH-001 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-002 | Authentication | Medium | Automated | `tests/ui/auth.spec.ts` |
| AUTH-003 | Authentication | Low | Automated | `tests/ui/auth.spec.ts` |
| AUTH-004 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-005 | Authentication | Medium | Automated | `tests/ui/auth.spec.ts` |
| AUTH-006 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-007 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-008 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-009 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-010 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-011 | Authentication | Medium | Automated | `tests/ui/auth.spec.ts` |
| AUTH-012 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-013 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-014 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-015 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-016 | Authentication | Critical | Automated | `tests/ui/auth.spec.ts` |
| AUTH-017 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-018 | Authentication | Medium | BLOCKED (test.fixme) | `tests/ui/auth.spec.ts` |
| AUTH-019 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-020 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-021 | Authentication | Low | Automated | `tests/ui/auth.spec.ts` |
| AUTH-022 | Authentication | Medium | Automated | `tests/ui/auth.spec.ts` |
| AUTH-023 | Authentication | High | Automated | `tests/ui/auth.spec.ts` |
| AUTH-024 | Authentication | High | BLOCKED (test.fixme) | `tests/ui/auth.spec.ts` |
| AUTH-025 | Authentication | Medium | BLOCKED (test.fixme) | `tests/ui/auth.spec.ts` |
| AAPI-001 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-002 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-003 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-004 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-005 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-006 | Authentication | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-007 | Authentication | High | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| AAPI-008 | Authentication | Critical | Automated | `tests/api/remaining.api.spec.ts` |
| AAPI-009 | Authentication | High | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DASH-001 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-002 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-003 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-004 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-005 | Dashboard | Critical | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-006 | Dashboard | Critical | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-007 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-008 | Dashboard | Medium | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-009 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-010 | Dashboard | Critical | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-011 | Dashboard | Critical | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-012 | Dashboard | Medium | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-013 | Dashboard | Critical | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-014 | Dashboard | Medium | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-015 | Dashboard | High | Automated | `tests/ui/dashboard.spec.ts` |
| DASH-016 | Dashboard | Low | Automated | `tests/ui/dashboard.spec.ts` |
| DAPI-001 | Dashboard | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DAPI-002 | Dashboard | High | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DAPI-003 | Dashboard | Critical | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DAPI-004 | Dashboard | Medium | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DAPI-005 | Dashboard | High | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| DAPI-006 | Dashboard | Medium | Automated | `tests/api/auth-dashboard.api.spec.ts` |
| CLNT-001 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-002 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-003 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-004 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-005 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-006 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-007 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-008 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-009 | Client | Critical | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-010 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-011 | Client | Medium | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-012 | Client | Low | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-013 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-014 | Client | Medium | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-015 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-016 | Client | High | Automated | `tests/ui/client-address.spec.ts` |
| CLNT-017 | Client | Medium | Automated | `tests/ui/client-address.spec.ts` |
| CAPI-001 | Client | High | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-002 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-003 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-004 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-005 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-006 | Client | High | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-007 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| CAPI-008 | Client | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| ADDR-001 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-002 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-003 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-004 | Address & Contact | Medium | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-005 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-006 | Address & Contact | Medium | Automated | `tests/ui/remaining.spec.ts` |
| ADDR-007 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-008 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-009 | Address & Contact | Medium | Automated | `tests/ui/remaining.spec.ts` |
| ADDR-010 | Address & Contact | Medium | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-011 | Address & Contact | Medium | Automated | `tests/ui/client-address.spec.ts` |
| ADDR-012 | Address & Contact | High | Automated | `tests/ui/client-address.spec.ts` |
| ACAPI-001 | Address & Contact | High | Automated | `tests/api/application-modules.api.spec.ts` |
| ACAPI-002 | Address & Contact | High | Automated | `tests/api/application-modules.api.spec.ts` |
| ACAPI-003 | Address & Contact | Medium | Automated | `tests/api/remaining.api.spec.ts` |
| KYC-001 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-002 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-003 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-004 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-005 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-006 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-007 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-008 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-009 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-010 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-011 | KYC / Financial / Compliance | Medium | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-012 | KYC / Financial / Compliance | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-013 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-014 | KYC / Financial / Compliance | High | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-015 | KYC / Financial / Compliance | High | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| KYC-016 | KYC / Financial / Compliance | High | BLOCKED (test.fixme) | `tests/ui/remaining.spec.ts` |
| KYC-017 | KYC / Financial / Compliance | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| KAPI-001 | KYC / Financial / Compliance | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| KAPI-002 | KYC / Financial / Compliance | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| KAPI-003 | KYC / Financial / Compliance | High | Automated | `tests/api/application-modules.api.spec.ts` |
| KAPI-004 | KYC / Financial / Compliance | High | Automated | `tests/api/remaining.api.spec.ts` |
| PROD-001 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-002 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-003 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-004 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-005 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-006 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-007 | Product | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-008 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-009 | Product | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-010 | Product | High | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-011 | Product | High | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-012 | Product | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PROD-013 | Product | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| PAPI-001 | Product | Critical | BLOCKED (test.fixme) | `tests/api/application-modules.api.spec.ts` |
| PAPI-002 | Product | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| PAPI-003 | Product | High | Automated | `tests/api/application-modules.api.spec.ts` |
| PAPI-004 | Product | Critical | Automated | `tests/api/remaining.api.spec.ts` |
| PAPI-005 | Product | Medium | Automated | `tests/api/application-modules.api.spec.ts` |
| RDR-001 | Riders | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-002 | Riders | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-003 | Riders | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-004 | Riders | High | BLOCKED (test.fixme) | `tests/ui/remaining.spec.ts` |
| RDR-005 | Riders | Critical | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-006 | Riders | High | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-007 | Riders | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-008 | Riders | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-009 | Riders | High | BLOCKED (test.fixme) | `tests/ui/remaining.spec.ts` |
| RDR-010 | Riders | Critical | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-011 | Riders | Medium | Automated | `tests/ui/remaining.spec.ts` |
| RDR-012 | Riders | Critical | BLOCKED (test.fixme) | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-013 | Riders | High | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RDR-014 | Riders | Medium | Automated | `tests/ui/kyc-product-riders.spec.ts` |
| RAPI-001 | Riders | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| RAPI-002 | Riders | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| RAPI-003 | Riders | Critical | BLOCKED (test.fixme) | `tests/api/remaining.api.spec.ts` |
| RAPI-004 | Riders | High | Automated | `tests/api/remaining.api.spec.ts` |
| BEN-001 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-002 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-003 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-004 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-005 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-006 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-007 | Beneficiaries | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-008 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-009 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-010 | Beneficiaries | Medium | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-011 | Beneficiaries | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-012 | Beneficiaries | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-013 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-014 | Beneficiaries | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-015 | Beneficiaries | High | Automated | `tests/ui/remaining.spec.ts` |
| BEN-016 | Beneficiaries | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-017 | Beneficiaries | High | BLOCKED (test.fixme) | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-018 | Beneficiaries | Medium | BLOCKED (test.fixme) | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-019 | Beneficiaries | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| BEN-020 | Beneficiaries | Medium | BLOCKED (test.fixme) | `tests/ui/beneficiaries-documents.spec.ts` |
| BAPI-001 | Beneficiaries | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| BAPI-002 | Beneficiaries | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| BAPI-003 | Beneficiaries | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| BAPI-004 | Beneficiaries | High | Automated | `tests/api/application-modules.api.spec.ts` |
| BAPI-005 | Beneficiaries | Critical | Automated | `tests/api/remaining.api.spec.ts` |
| DOC-001 | Documents | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-002 | Documents | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-003 | Documents | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-004 | Documents | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-005 | Documents | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-006 | Documents | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-007 | Documents | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-008 | Documents | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-009 | Documents | Critical | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-010 | Documents | Medium | Automated | `tests/ui/remaining.spec.ts` |
| DOC-011 | Documents | Medium | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-012 | Documents | Medium | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-013 | Documents | Low | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-014 | Documents | Medium | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DOC-015 | Documents | High | Automated | `tests/ui/beneficiaries-documents.spec.ts` |
| DAPI2-001 | Documents | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| DAPI2-002 | Documents | Critical | Automated | `tests/api/remaining.api.spec.ts` |
| DAPI2-003 | Documents | High | Automated | `tests/api/remaining.api.spec.ts` |
| DAPI2-004 | Documents | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| REV-001 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-002 | Review / Submit | Critical | Automated | `tests/ui/review-status.spec.ts` |
| REV-003 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-004 | Review / Submit | Critical | Automated | `tests/ui/review-status.spec.ts` |
| REV-005 | Review / Submit | Critical | Automated | `tests/ui/review-status.spec.ts` |
| REV-006 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-007 | Review / Submit | Critical | Automated | `tests/ui/review-status.spec.ts` |
| REV-008 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-009 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-010 | Review / Submit | Critical | Automated | `tests/ui/review-status.spec.ts` |
| REV-011 | Review / Submit | Medium | Automated | `tests/ui/review-status.spec.ts` |
| REV-012 | Review / Submit | Medium | Automated | `tests/ui/review-status.spec.ts` |
| REV-013 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-014 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| REV-015 | Review / Submit | High | Automated | `tests/ui/review-status.spec.ts` |
| RAPI2-001 | Review / Submit | High | Automated | `tests/api/application-modules.api.spec.ts` |
| RAPI2-002 | Review / Submit | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| RAPI2-003 | Review / Submit | Critical | BLOCKED (test.fixme) | `tests/api/remaining.api.spec.ts` |
| RAPI2-004 | Review / Submit | High | Automated | `tests/api/remaining.api.spec.ts` |
| RAPI2-005 | Review / Submit | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| RAPI2-006 | Review / Submit | High | Automated | `tests/api/application-modules.api.spec.ts` |
| STAT-001 | Status Tracking | Critical | Automated | `tests/ui/review-status.spec.ts` |
| STAT-002 | Status Tracking | Critical | Automated | `tests/ui/review-status.spec.ts` |
| STAT-003 | Status Tracking | Critical | Automated | `tests/ui/review-status.spec.ts` |
| STAT-004 | Status Tracking | High | BLOCKED (test.fixme) | `tests/ui/review-status.spec.ts` |
| STAT-005 | Status Tracking | Medium | Automated | `tests/ui/review-status.spec.ts` |
| STAT-006 | Status Tracking | Critical | Automated | `tests/ui/review-status.spec.ts` |
| STAT-007 | Status Tracking | Medium | Automated | `tests/ui/review-status.spec.ts` |
| SAPI-001 | Status Tracking | Critical | Automated | `tests/api/application-modules.api.spec.ts` |
| SAPI-002 | Status Tracking | High | Automated | `tests/api/application-modules.api.spec.ts` |
| DB-001 | Database | High | Automated | `tests/ui/review-status.spec.ts` |
| DB-002 | Database | High | Automated | `tests/ui/review-status.spec.ts` |
| DB-003 | Database | High | Automated | `tests/ui/review-status.spec.ts` |
| DB-004 | Database | Medium | Automated | `tests/ui/review-status.spec.ts` |
| DB-005 | Database | High | Automated | `tests/ui/review-status.spec.ts` |
| NAV-001 | Navigation & Routes | High | Automated | `tests/ui/review-status.spec.ts` |
| NAV-002 | Navigation & Routes | High | Automated | `tests/ui/review-status.spec.ts` |
| NAV-003 | Navigation & Routes | Medium | Automated | `tests/ui/review-status.spec.ts` |
| NAV-004 | Navigation & Routes | Medium | Automated | `tests/ui/review-status.spec.ts` |
| NAV-005 | Navigation & Routes | Medium | Automated | `tests/ui/remaining.spec.ts` |
| E2E-001 | End-to-End | Critical | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-002 | End-to-End | Critical | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-003 | End-to-End | Critical | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-004 | End-to-End | Critical | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-005 | End-to-End | High | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-006 | End-to-End | High | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-007 | End-to-End | High | Automated | `tests/e2e/journeys.spec.ts` |
| E2E-008 | End-to-End | Critical | Automated | `tests/e2e/journeys.spec.ts` |
| GAPI-001 | API General | High | Automated | `tests/api/application-modules.api.spec.ts` |
| GAPI-002 | API General | Medium | Automated | `tests/api/application-modules.api.spec.ts` |
| GAPI-003 | API General | Low | Automated | `tests/api/application-modules.api.spec.ts` |
| GAPI-004 | API General | High | BLOCKED (test.fixme) | `tests/api/remaining.api.spec.ts` |
| GAPI-005 | API General | High | Automated | `tests/api/application-modules.api.spec.ts` |
| GAPI-006 | API General | Low | Automated | `tests/api/application-modules.api.spec.ts` |
| NFR-001 | Cross-cutting | Medium | Automated | `tests/ui/remaining.spec.ts` |
| NFR-002 | Cross-cutting | Low | Automated | `tests/ui/review-status.spec.ts` |
| NFR-003 | Cross-cutting | Medium | Automated | `tests/ui/review-status.spec.ts` |
| NFR-004 | Cross-cutting | Medium | Automated | `tests/api/remaining.api.spec.ts` |
| NFR-005 | Cross-cutting | Medium | Automated | `tests/api/remaining.api.spec.ts` |
| NFR-006 | Cross-cutting | Medium | Automated | `tests/ui/review-status.spec.ts` |
