# EasyWeb

A WordPress-style core + plugins system for Next.js — a set of reusable,
versioned packages (page builder, auth, admin CRUD, forms) that any
project can install, and upgrade with a single command, instead of
rebuilding common systems from scratch every time.

## Why

Next.js apps are compiled and deployed individually, so there's no
runtime plugin system like WordPress. EasyWeb gets you the same
practical benefit — build once, reuse everywhere, upgrade centrally —
using versioned npm packages instead.

## Packages

| Package | What it gives you |
|---|---|
| `@easyweb/page-builder` | A Puck-based visual page builder: widgets (Section, Heading, Divider, etc.), reusable field types (color, spacing, responsive), and a `PageRenderer` |
| `@easyweb/auth-kit` | Auth.js v5 setup with Credentials + Google OAuth, PrismaAdapter wiring, and role-based middleware helpers |
| `@easyweb/admin-kit` | Reusable admin CRUD scaffolding: drag-reorder lists, delete confirmation patterns, modal patterns |
| `@easyweb/form-system` | A generic Form widget + submission storage, so you're not hand-building forms per project |

## Quick start (using EasyWeb in your own project)

```bash
npm install @easyweb/page-builder @easyweb/auth-kit
```

```js
// src/lib/pageBuilder/config.js
import { pageBuilderConfig } from '@easyweb/page-builder';
export default pageBuilderConfig;
```

Copy the Prisma schema snippet each package ships (see
`node_modules/@easyweb/page-builder/prisma/page-builder.prisma`) into
your own `prisma/schema/` folder — this is the one manual step, since
Prisma schemas can't be imported like JS code.

Full setup instructions, versioning rules, and the complete new-project
walkthrough are in [`DOCS.md`](./DOCS.md).

## Starting a brand-new project from scratch

Clone the [`easyweb-starter`](./easyweb-starter) template — it comes
pre-wired with the packages above, a working route structure, and an
`.env.example` covering everything you need.

## Contributing

This project is open for anyone to use and extend. Widgets, fields, and
patterns are intentionally kept generic and free of any one project's
business logic — see `DOCS.md` section 9 for what belongs in core vs.
what should stay in your own project.

## License

MIT — see [`LICENSE`](./LICENSE).
