# yourorg-core — A-Z Guide

This is the reusable "core system" for all projects: a WordPress-style
core + plugins model, adapted for Next.js. Instead of runtime-installed
plugins, reusable systems are versioned private npm packages. Every new
project installs what it needs and upgrades with a single command.

---

## 1. Philosophy

- **Core packages** (`packages/*`) hold anything genuinely reusable across
  projects: the page builder, auth setup, admin CRUD patterns, the form
  system.
- **Each project** installs only the packages it needs, and builds
  everything else itself (its own domain models, its own custom widgets).
- **Upgrading a project** = `npm update @yourorg/<package>`. That's the
  whole "update" step — no manual file copying, no re-implementing.
- **The one thing that can't be a package**: Prisma schema. It's copied
  once per project from each package's `prisma/*.prisma` file, then
  evolves independently per project from there on.

---

## 2. Repo layout

```
yourorg-core/                      ← this repo (the workspace)
  package.json                     ← npm workspace root
  .npmrc                           ← GitHub Packages auth
  packages/
    page-builder/                  ← @yourorg/page-builder
      package.json
      src/
        widgets/                   ← Divider, Section, Heading, etc.
        fields/                    ← colorField, spacingBoxField, resolveColor, responsiveStyle
        index.js                   ← exports pageBuilderConfig + PageRenderer
        PageRenderer.jsx
      prisma/
        page-builder.prisma        ← Page, SiteTheme models
    auth-kit/                      ← @yourorg/auth-kit
      package.json
      src/
        auth.js                    ← createAuthConfig()
        middleware-helpers.js
        index.js
      prisma/
        auth-kit.prisma            ← Admin, User, Account, Session, VerificationToken
    admin-kit/                     ← @yourorg/admin-kit
      package.json
      src/index.js                 ← DeleteButton, DraggableList, AdminTable (extract as needed)
    form-system/                   ← @yourorg/form-system
      package.json
      src/index.js                 ← Form widget + submit handler
      prisma/
        form-system.prisma         ← FormSubmission model
  starter-template/                ← what gets cloned to start a NEW project
    package.json                   ← references @yourorg/* as dependencies
    .npmrc
    .env.example
    prisma/
      schema.prisma                ← base datasource + generator, schema/ folder merges in
    src/app/(public)/[...slug]/page.js   ← thin route using PageRenderer
```

---

## 3. One-time setup of yourorg-core itself

### 3.1 Create a GitHub Personal Access Token (classic)

1. GitHub → Settings → Developer settings → Personal access tokens →
   Tokens (classic).
2. Generate new token with scopes: `write:packages`, `read:packages`,
   `repo` (if the repo is private).
3. Save it somewhere safe — you'll use it as `GITHUB_TOKEN` locally and
   in every consuming project's `.env`.

This is completely free — GitHub Packages is included on the Free plan
for private repos, with a 500 MB storage allowance shared with Actions
artifacts. Source-only JS packages like these will stay a tiny fraction
of that indefinitely.

### 3.2 Authenticate npm locally

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

(Or put it in your shell profile so it's always available.) The `.npmrc`
files already committed in this repo and in the starter template point
`@yourorg` scoped packages at `npm.pkg.github.com` and read the token
from that environment variable — no per-project extra config needed.

### 3.3 Install workspace dependencies

```bash
cd yourorg-core
npm install
```

This links all `packages/*` together via the npm workspace, so during
development you can edit `packages/page-builder` and it's immediately
usable if you're also running a project inside the same workspace
(optional — most of the time you'll develop packages standalone and
publish + update in real projects, which is simpler to reason about).

---

## 4. Publishing a package (first time or after changes)

```bash
cd packages/page-builder
# bump version first — see versioning rules in section 7
npm version patch      # or: minor / major
npm publish
```

`npm publish` reads `publishConfig.registry` from `package.json` and
pushes the new version to GitHub Packages under your org's scope. It's
now available to any project with the matching `.npmrc` and
`GITHUB_TOKEN`.

---

## 5. Starting a brand-new project — step by step

### Step 1 — Scaffold from the starter template

```bash
git clone <your-starter-template-repo-url> my-new-project
cd my-new-project
rm -rf .git && git init
```

(Or use `npx degit yourorg/starter-template my-new-project` if the
template is public/degit-friendly — works the same for private repos
with an auth token.)

### Step 2 — Install dependencies

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx   # if not already set globally
npm install
```

This pulls in `@yourorg/page-builder`, `@yourorg/auth-kit`, etc. as
listed in `package.json` — only keep the ones this project actually
needs, remove the rest.

### Step 3 — Copy in Prisma schema snippets

```bash
mkdir -p prisma/schema
cp node_modules/@yourorg/page-builder/prisma/page-builder.prisma prisma/schema/
cp node_modules/@yourorg/auth-kit/prisma/auth-kit.prisma prisma/schema/
cp node_modules/@yourorg/form-system/prisma/form-system.prisma prisma/schema/
```

> Note: `Page.createdBy` relates to `Admin`, which lives in
> `auth-kit.prisma` — always copy `auth-kit.prisma` alongside
> `page-builder.prisma`, or remove that relation field if you're not
> using auth-kit in this project.

Add your own project-specific models directly in `prisma/schema.prisma`
or as new files in `prisma/schema/` (Prisma v6 multi-file schema support
merges everything in that folder automatically — do not add
`prisma.config.ts`, that's Prisma v7 only).

### Step 4 — Environment variables

```bash
cp .env.example .env.local
```

Fill in a fresh Neon database's `DATABASE_URL`/`DIRECT_URL`, a new
`AUTH_SECRET` (generate with `npx auth secret`), your `AUTH_URL` (set
this explicitly — Auth.js v5 cannot reliably auto-detect host,
especially on Vercel), and OAuth/Uploadthing keys for this project.

```bash
npx prisma generate
npx prisma db push
```

### Step 5 — Wire up thin route files

The starter template already includes the catch-all route
(`src/app/(public)/[...slug]/page.js`) pre-wired to
`@yourorg/page-builder`'s `PageRenderer`. Verify it matches your
project's route group structure, then create equivalents for:

- `(public)/page.js` — actual homepage root (separate from the catch-all)
- `admin/pages/**` — page builder editor screens
- any blog/course/event detail routes this project needs, if reusing
  those patterns

### Step 6 — Build what's actually unique to this project

Everything generic is now working out of the box. From here, build only
this project's own domain: its own Prisma models, its own custom
widgets (if the shared widget set doesn't cover something), its own
business logic.

### Step 7 — Deploy

```bash
git add . && git commit -m "Initial scaffold"
git remote add origin <new-repo-url>
git push -u origin main
```

On Vercel:
- Connect the repo.
- Set the same env vars, **plus** `GITHUB_TOKEN` so Vercel's build step
  can `npm install` the private `@yourorg/*` packages.
- Confirm build command is `prisma generate && next build`.
- Deploy.

---

## 6. Updating a project when core packages improve

Say you added a new widget to `@yourorg/page-builder` in a different
project, or directly in `yourorg-core`.

1. In `yourorg-core/packages/page-builder`, add the widget, register it
   in `src/index.js`'s `pageBuilderConfig.components`.
2. Bump the version (see section 7) and `npm publish`.
3. In any project that wants the update:
   ```bash
   npm update @yourorg/page-builder
   ```
4. Restart the dev server / redeploy. The widget now appears in that
   project's Puck editor — **no code changes needed in the project**,
   because the project never hardcodes the widget list, it only imports
   `pageBuilderConfig` as a whole.

This is the literal equivalent of clicking "Update" on a WordPress
plugin — except it's one command, and you choose exactly when each
project takes it.

---

## 7. Versioning rules

Use semver strictly on every package:

- **Patch** (`1.4.0` → `1.4.1`) — bug fix, no behavior change. Always
  safe to update.
- **Minor** (`1.4.1` → `1.5.0`) — new feature, backward compatible
  (e.g. a new widget, a new optional field). Safe to update.
- **Major** (`1.5.0` → `2.0.0`) — breaking change (renamed a prop,
  removed a field, changed a function signature). Requires you to go
  update the calling code in each project before/after updating.

Keep a `CHANGELOG.md` in each package folder. Write the entry *when you
publish*, not later — you will not remember why you bumped a version
three months from now otherwise.

---

## 8. Extracting a new reusable piece from a project

When you build something in a project and realize it should be shared:

1. Copy the finished, working file(s) into the relevant
   `yourorg-core/packages/<package>/src/` folder.
2. Strip out anything project-specific (hardcoded IDs, project-only
   Prisma model names, hardcoded copy/text).
3. If it needs new Prisma fields, add them to that package's
   `prisma/<package>.prisma` file — but remember this only affects
   *future* projects that copy it fresh; already-scaffolded projects
   need the field added to their own schema manually.
4. Register/export it from the package's `index.js`.
5. Bump version, publish, `npm update` in the original project so it now
   consumes its own extracted code from the shared package instead of
   its local copy (keeps a single source of truth going forward).

---

## 9. What deliberately does NOT belong in core

- Project-specific Prisma models (e.g. `Course`, `Batch`,
  `MockTestQuestion`) — these stay in each project. Only the *pattern*
  (e.g. a drag-reorder admin list, an MCQ builder UI) gets extracted as
  a generic reusable component, not the specific model.
- Anything with hardcoded copy, branding, or business rules specific to
  one project.

---

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `npm install` fails with 404/403 on `@yourorg/*` | `GITHUB_TOKEN` missing or expired, or `.npmrc` not present in the project |
| New widget doesn't show up in Puck editor after `npm update` | Check it was actually registered in `pageBuilderConfig.components` in `src/index.js` before publishing |
| Prisma error about missing `Admin` model | You copied `page-builder.prisma` without also copying `auth-kit.prisma` — `Page.createdBy` needs `Admin` to exist |
| Vercel build fails pulling private package | Add `GITHUB_TOKEN` as a Vercel environment variable so its build step can authenticate to GitHub Packages |
