<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial fill from template — all placeholders replaced)
Added sections:
  - Core Principles (5 principles: KISS, Document Everything, Iterative Development,
    Web-First, Playability First)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: None
Templates reviewed:
  - .specify/templates/plan-template.md ✅ (no changes required; Constitution Check
    placeholder is dynamically filled per plan — not a static template token)
  - .specify/templates/spec-template.md ✅ (no changes required)
  - .specify/templates/tasks-template.md ✅ (no changes required)
  - .github/agents/speckit.constitution.agent.md ✅ (no outdated agent-specific
    references found)
Follow-up TODOs: None — all placeholders resolved.
-->

# Space Invaders Constitution

## Core Principles

### I. Keep It Simple (KISS)

The simplest solution that works MUST be preferred at all times.

- Complexity MUST be explicitly justified; default to the minimal viable approach.
- YAGNI (You Aren't Gonna Need It): features not currently required MUST NOT be built.
- Native browser APIs MUST be preferred over third-party libraries; any dependency
  requires written justification in the feature plan.
- Game logic MUST be easy to read, reason about, and modify by any contributor.

**Rationale**: Space Invaders is a well-scoped game. Over-engineering invites maintenance
burden and obscures learning value. Simple code is more robust and faster to iterate on.

### II. Document Everything

All code MUST be documented before a feature is considered complete.

- Every function, class, module, and non-obvious logic block MUST carry a JSDoc comment
  or an inline comment explaining *what* it does and *why*.
- Public APIs (exported functions, game-loop hooks, event handlers) MUST include
  parameter and return-type annotations in comments.
- Game-specific constants (speeds, scores, canvas dimensions) MUST include a comment
  explaining their purpose and unit of measure.
- Undocumented code MUST NOT be merged to the main branch.

**Rationale**: Documentation is a primary deliverable alongside working code. It ensures
the project remains approachable, educational, and maintainable across iterations.

### III. Iterative Development

Features MUST be built and validated incrementally; every committed iteration MUST leave
the game in a playable and demonstrable state.

- No "work in progress" commits that break core gameplay (player movement, shooting,
  or enemy rendering) are permitted on the main branch.
- Each iteration MUST deliver one coherent, independently testable slice of functionality
  (e.g., enemy movement, collision detection, scoring).
- Big-bang feature releases are prohibited; incremental merges are required.

**Rationale**: Iterative delivery reduces integration risk and allows continuous
validation of the game experience. It aligns directly with the KISS principle.

### IV. Web-First, No Mandatory Build Step

The game MUST run directly in a modern browser without a mandatory build or compile step.

- Source files (HTML, CSS, JS) MUST be directly openable via `file://` or a simple
  static server; no bundler (Webpack, Vite, Rollup, etc.) unless explicitly approved
  and justified in the feature plan.
- ES Modules (`<script type="module">`) are permitted.
- The game MUST be verified against at least one modern browser (Chrome or Firefox)
  before any merge.

**Rationale**: Eliminating a build pipeline reduces setup friction, aligns with KISS,
and keeps the project accessible to contributors at all skill levels.

### V. Playability Is Non-Negotiable

The core game loop MUST remain functional on the main branch at all times.

- The following MUST always work on `main`: canvas renders, player moves, enemies
  appear and move, shooting fires a projectile.
- Any change that breaks core gameplay MUST be fixed before any other work proceeds.
- Game feel (frame rate, input responsiveness) MUST be manually assessed after each
  iteration before merging.

**Rationale**: A broken game loop invalidates all other work. Keeping gameplay functional
ensures every iteration can be demonstrated and tested by stakeholders immediately.

## Technology Stack

This project is a browser-based Space Invaders clone built with standard web technologies.

- **Runtime**: Browser (no Node.js runtime required to play the game)
- **Language**: Vanilla JavaScript (ES2020+); TypeScript MAY be adopted if justified in
  a feature plan
- **Rendering**: HTML5 Canvas API
- **Styling**: Plain CSS; no CSS frameworks required
- **Testing**: Manual browser testing is the baseline; automated tests (e.g., Jest with
  jsdom) MAY be added for logic-heavy modules when explicitly requested
- **Hosting**: Static file serving (GitHub Pages, `npx serve`, or direct `file://` open)
- **Dependencies**: Zero runtime dependencies by default; any addition MUST be justified
  in the feature plan

## Development Workflow

Development follows a plan → specify → implement loop aligned with Principle III.

- Every new feature MUST have a spec before implementation begins.
- Plans MUST include a Constitution Check gate verifying compliance with Principles I–V.
- Code review (or self-review for solo contributors) MUST confirm documentation
  completeness per Principle II before merge.
- Each merged increment MUST be manually verified as playable in a browser per
  Principle V.
- Branch naming convention: `###-short-description` (e.g., `001-enemy-movement`).

## Governance

This constitution supersedes all other project practices and conventions. Any conflict
between this document and another guideline is resolved in favor of this constitution.

**Amendment Procedure**:

1. Propose the amendment with rationale in a pull request or discussion.
2. Increment `CONSTITUTION_VERSION` per the versioning policy below.
3. Update `LAST_AMENDED_DATE` to the ISO date of the amendment.
4. Run the consistency propagation checklist against all templates and agent files.
5. Record the change in the Sync Impact Report HTML comment at the top of this file.

**Versioning Policy**:

- MAJOR: A principle is removed, redefined incompatibly, or a non-negotiable constraint
  is relaxed.
- MINOR: A new principle or section is added, or existing guidance is materially
  expanded.
- PATCH: Clarifications, wording improvements, or typo fixes with no semantic change.

**Compliance Review**: All pull requests MUST include a Constitution Check confirming
the change satisfies Principles I–V. The Constitution Check gate in
`.specify/templates/plan-template.md` is the primary enforcement point.

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
