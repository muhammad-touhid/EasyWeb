# EasyWeb — A-Z Maintainer Guide

This is the reusable "core system" behind EasyWeb: a WordPress-style
core + plugins model, adapted for Next.js. Instead of runtime-installed
plugins, reusable systems are versioned **public** npm packages, free
for anyone to install and use in their own projects. Every new project
built with EasyWeb installs what it needs and upgrades with a single
command.

> This file is the internal maintainer guide (how to build, publish,
> and extend EasyWeb itself). For the public-facing quick-start, see
> [`README.md`](./README.md).

---

## 1. Philosophy

- **Core packages** (`packages/*`) hold anything genuinely reusable across
  projects: the page builder, auth setup, admin CRUD patterns, the form
  system.
- **Each project** installs only the packages it needs, and builds
  everything else itself (its own domain models, its own custom widgets).
- **Upgrading a project** = `npm update @easyweb59/<package>`. That's the
  whole "update" step — no manual file copying, no re-implementing.
- **The one thing that can't be a package**: Prisma schema. It's copied
  once per project from each package's `prisma/*.prisma` file, then
  evolves independently per project from there on.

---

## 2. Repo layout

```
easyweb-core/                      ← this repo (the workspace)
  package.json                     ← npm workspace root
  LICENSE                          ← MIT
  README.md                        ← public-facing overview
  packages/
    page-builder/                  ← @easyweb59/page-builder
      package.json
      src/
        widgets/                   ← Divider, Section, Heading, etc.
        fields/                    ← colorField, spacingBoxField, resolveColor, responsiveStyle
        index.js                   ← exports pageBuilderConfig + PageRenderer
        PageRenderer.jsx
      prisma/
        page-builder.prisma        ← Page, SiteTheme models
    auth-kit/                      ← @easyweb59/auth-kit
      package.json
      src/
        auth.js                    ← createAuthConfig()
        middleware-helpers.js
        index.js
      prisma/
        auth-kit.prisma            ← Admin, User, Account, Session, VerificationToken
    admin-kit/                     ← @easyweb59/admin-kit
      package.json
      src/index.js                 ← DeleteButton, DraggableList, AdminTable (extract as needed)
    form-system/                   ← @easyweb59/form-system
      package.json
      src/index.js                 ← Form widget + submit handler
      prisma/
        form-system.prisma         ← FormSubmission model
  starter-template/                ← what gets cloned to start a NEW project
    package.json                   ← references @easyweb59/* as dependencies
    .env.example
    prisma/
      schema.prisma                ← base datasource + generator, schema/ folder merges in
    src/app/(public)/[...slug]/page.js   ← thin route using PageRenderer
```

---

## 3. One-time setup of easyweb-core itself

Since EasyWeb is meant to be open for anyone to use, packages are
published to the **public npm registry** — not GitHub Packages. This
means anyone can `npm install @easyweb59/page-builder` with zero
authentication. You only need to authenticate when *you* publish a new
version.

### 3.1 Create a free npm account and organization

1. Go to https://www.npmjs.com/signup and create a free account.
2. Since `@easyweb` is a scoped package name, also create the `easyweb`
   **organization** on npm (Account → Add Organization). The free tier
   supports unlimited public packages under an org scope.

### 3.2 Authenticate npm locally

```bash
npm login
```

This opens a browser prompt to authenticate and stores credentials
locally. No token needs to be committed anywhere, and no `.npmrc`
secrets are required in this repo — installing public packages needs no
auth at all, only publishing does.

### 3.3 Install workspace dependencies

```bash
cd easyweb-core
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

Each package's `package.json` sets `"publishConfig": { "access": "public" }`,
so `npm publish` pushes the new version straight to the public npm
registry. Anyone, anywhere, can now run `npm install @easyweb59/page-builder`
with no login and no token — that's the whole point of making this open.

---

## 5. Starting a brand-new project — step by step

### Step 1 — Scaffold from the starter template

```bash
git clone <your-starter-template-repo-url> my-new-project
cd my-new-project
rm -rf .git && git init
```

(Or use `npx degit easyweb/easyweb-starter my-new-project` — works
directly since the template repo is public.)

### Step 2 — Update dependencies to latest, then install

The starter template's `package.json` versions age the moment you stop
touching it. Rather than manually editing version numbers each time you
scaffold a new project, bump everything to the latest compatible
versions automatically:

```bash
npm run update-deps
```

This runs [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates)
(via `npx`, no install needed) to rewrite every version in
`package.json` to the current latest, then runs `npm install`. It's
already wired up as a script in the starter template.

> If you'd rather not touch versions at all right now, plain
> `npm install` still works — no auth needed, `@easyweb59/*` packages are
> public. `update-deps` is just the recommended first step for a fresh
> project so you're not starting on stale pins.

This pulls in `@easyweb59/page-builder`, `@easyweb59/auth-kit`, etc. as
listed in `package.json` — only keep the ones this project actually
needs, remove the rest.

> **Note on major version bumps:** `npm-check-updates -u` will happily
> jump `next` or `react` across a major version (e.g. 15 → 16) if one
> has shipped. That's usually fine for a fresh project with no code
> written yet, but skim the release notes for anything bumped to a new
> major before you start building — a breaking change caught here costs
> minutes; caught after you've written code, it costs hours.

### Step 3 — Copy in Prisma schema snippets

```bash
mkdir -p prisma/schema
cp node_modules/@easyweb59/page-builder/prisma/page-builder.prisma prisma/schema/
cp node_modules/@easyweb59/auth-kit/prisma/auth-kit.prisma prisma/schema/
cp node_modules/@easyweb59/form-system/prisma/form-system.prisma prisma/schema/
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
`@easyweb59/page-builder`'s `PageRenderer`. Verify it matches your
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
- Set the same env vars (database, auth, OAuth, Uploadthing). No
  package-registry token needed — `@easyweb59/*` packages install with no
  auth since they're public.
- Confirm build command is `prisma generate && next build`.
- Deploy.

---

## 6. Updating a project when core packages improve

Say you added a new widget to `@easyweb59/page-builder` in a different
project, or directly in `easyweb-core`.

1. In `easyweb-core/packages/page-builder`, add the widget, register it
   in `src/index.js`'s `pageBuilderConfig.components`.
2. Bump the version (see section 7) and `npm publish`.
3. In any project that wants the update:
   ```bash
   npm update @easyweb59/page-builder
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
   `easyweb-core/packages/<package>/src/` folder.
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
| `npm install` fails with 404 on `@easyweb59/*` | Package hasn't been published yet, or the name/version in `package.json` is wrong — check https://npmjs.com/package/@easyweb59/page-builder |
| `npm publish` fails with 403 | You're not logged in (`npm login`) or not a member of the `easyweb` npm organization |
| New widget doesn't show up in Puck editor after `npm update` | Check it was actually registered in `pageBuilderConfig.components` in `src/index.js` before publishing |
| Prisma error about missing `Admin` model | You copied `page-builder.prisma` without also copying `auth-kit.prisma` — `Page.createdBy` needs `Admin` to exist |
