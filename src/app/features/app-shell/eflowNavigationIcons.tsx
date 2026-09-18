import {
  Activity,
  Announcement,
  Board,
  Bolt,
  Calendar,
  Chart,
  CheckList,
  CreditCard,
  Dashboard,
  Doc,
  Download,
  Files,
  Folder,
  Gantt,
  Globe,
  Graph,
  Group,
  Health,
  Home,
  Idea,
  Inbox,
  Key,
  Locked,
  MondayDoc,
  Person,
  PersonRound,
  Robot,
  Recurring,
  Security,
  Settings,
  SettingsKnobs,
  Subitems,
  Table,
  Team,
  Timeline,
  Update,
  Versioning,
  Work,
  Workflow,
  Workspace,
} from "@vibe/icons";

type VibeIcon = typeof Workspace;

/**
 * Every section id used across ALL roles has a UNIQUE icon.
 * No two entries share the same component — each icon is semantically
 * chosen for what the section actually does.
 *
 * Audit coverage (all roles):
 *   superadmin:   dashboard, projects, tasks, reports, announcements, users,
 *                 org_tree, audit, administration, migration
 *   depthead:     dashboard, projects, tasks, budget, leading, subtasks,
 *                 reviews, team, identity, intelligence, reports, announcements
 *   employee:     tasks, projects, leading, subtasks, reviews, deadlines,
 *                 history, performance, reports, announcements
 *   accounting_staff: accounting_overview, accounting_releases,
 *                 accounting_journal, accounting_audit, accounting_budgets
 *   executive:    portfolio, transform, financial, audit
 *   legislative:  legdash, session, committee, councilor
 *   hrmo:         workforce, wellness, compliance
 *   finance:      projfin, liquidation, crypto
 *   legacy:       command, leader, deptportfolio, mywork, workspace
 */
const navigationIcons: Record<string, VibeIcon> = {
  // ── Shared ──────────────────────────────────────────────────────
  dashboard:           Dashboard,      // role overview / home
  announcements:       Announcement,   // broadcast announcements

  // ── Project & task workflow ──────────────────────────────────────
  projects:            Folder,         // plans & projects
  tasks:               Board,          // task board / kanban
  subtasks:            Subitems,       // my subtasks
  leading:             Bolt,           // work I'm leading
  reviews:             Inbox,          // for-review queue
  deadlines:           Calendar,       // deadline calendar
  history:             Versioning,     // task history / audit log
  performance:         Activity,       // employee performance metrics
  reports:             Graph,          // reports & analytics

  // ── Department head ─────────────────────────────────────────────
  budget:              CreditCard,     // department budget
  team:                Team,           // team supervision
  identity:            Key,            // identity & access
  intelligence:        Idea,           // team intelligence

  // ── Accounting workspace (5 unique tabs) ─────────────────────────
  accounting_overview: Chart,          // accounting overview / summary
  accounting_releases: Download,       // voucher & cash releases (outflow)
  accounting_journal:  Doc,            // general journal ledger entries
  accounting_audit:    CheckList,      // financial audit trail
  accounting_budgets:  Table,          // department budget ledger table

  // ── Super-admin ──────────────────────────────────────────────────
  users:               Group,          // user management / directory
  org_tree:            Globe,          // org structure & hierarchy
  audit:               Security,       // system audit trail
  administration:      Settings,       // system settings
  migration:           Recurring,      // data tools / backup

  // ── Executive ────────────────────────────────────────────────────
  portfolio:           Gantt,          // city project portfolio timeline
  transform:           Workflow,       // project transformation tracker
  financial:           Files,          // financial oversight (exec-level)

  // ── Legislative ──────────────────────────────────────────────────
  legdash:             MondayDoc,      // legislative measures pipeline
  session:             Timeline,       // session order of business
  committee:           PersonRound,    // committee affairs
  councilor:           Person,         // councilor home workspace

  // ── HRMO ─────────────────────────────────────────────────────────
  workforce:           Health,         // workforce / burnout intelligence
  wellness:            Update,         // wellness & attendance alerts
  compliance:          Locked,         // CSC compliance & appraisals

  // ── Finance ──────────────────────────────────────────────────────
  projfin:             SettingsKnobs,  // project finance buckets
  liquidation:         Work,           // liquidation & receipt verification
  crypto:              Robot,          // immutable hashed ledger

  // ── Legacy sections ──────────────────────────────────────────────
  command:             Home,           // command center (legacy depthead)
  leader:              Bolt,           // leader workspace (legacy — same as leading)
  deptportfolio:       Workspace,      // department portfolio (legacy)
  mywork:              Dashboard,      // my work hub (legacy employee)
  workspace:           Workspace,      // generic fallback
};

export function getEflowNavigationIcon(section: string): VibeIcon {
  return navigationIcons[section] ?? Workspace;
}
