# Roadmap

## Phase 1: Bug Fixes

### Content.tsx
- [x] Fix wrong `React.FC<Props>` generic — should be `React.FC<ContentProps>`
- [x] Add null-check for `ckeditor.current` before accessing editor API
- [x] Replace CKEditor deep-import (`viewtoplaintext`) with local HTML-to-text utility

### Attachments.tsx
- [x] Fix wrong `React.FC<Props>` generic — should be `React.FC<AttachmentProps>`

### Settings.tsx
- [x] Fix crash when `initialValues` is `undefined` (no saved settings yet)

### Confirmation.tsx
- [x] Fix premature success display (`sentCount === recipients.length` is true at 0/0)
- [x] Guard `props.recipients[0]` against empty recipient list
- [x] Fix `filename` being `string | undefined` and Windows backslash paths
- [x] Add error handling: track failed recipients, show errors instead of false success
- [x] Guard against division by zero in Progress percent

### SendMailChannel.ts
- [x] Handle `buildTransporter` returning `undefined` for unknown transport type
- [x] Pass error details back to frontend (not just `success: false`)
- [x] Remove debug `console.log`
- [x] Keep transporter alive across a batch instead of creating/closing per mail

### SystemInfoChannel.ts
- [x] Guard `execSync('uname -a')` — fails on Windows — replaced with `os` module

## Phase 2: Security

- [x] Disable DevTools in production (`src/index.ts`) — uses `app.isPackaged`
- [x] Enable TLS certificate verification (`rejectUnauthorized: true`)
- [x] Encrypt passwords with `safeStorage` in main process (`SettingsStorage`, `SettingsStorageChannel`)
- [x] Add CSP (Content Security Policy) meta tag to `index.html`
- [x] Restrict IPC channels to allowlist in preload (`send-mail`, `system-info`, `settings-storage`)

## Phase 3: Improvements

### UX / Sending
- [x] Make sending cancellable (abort button during batch)
- [x] Configurable sleep interval between mails (InputNumber, default 1000 ms)
- [x] Collect failed recipients and offer CSV export of failures
- [x] Show per-recipient send status table during sending
- [x] Add "dry run" mode that previews each mail without sending

### Code Quality
- [x] Extract `getJsonFromLocalStorage` into a shared utility (duplicated in 4 files)
- [x] Fix icon path in `index.ts` (`'./images/icon.png'` → resolve via `app.getAppPath()`)
- [x] Enable TypeScript `strict` mode in `tsconfig.json`
- [x] Remove `any` types throughout the codebase
- [x] Extract `replaceTemplateStrings` into shared module (`src/shared/replaceTemplateStrings.ts`)
- [x] Add unit tests for `replaceTemplateStrings`, CSV parsing, `htmlToPlainText` (Vitest, 28 tests)
- [x] **Upgrade TypeScript** — done in Phase 4 (TS 6.0)

### Documentation
- [x] Update `package.json` description
- [x] Update README: mention Gmail support, individual attachments, template variables
- [x] Add AGENTS.md with lint / typecheck commands

### Build / CI
- [x] Add `typecheck` script to `package.json` (`tsc --noEmit`)
- [x] Add `test` and `test:watch` scripts to `package.json` (Vitest)
- [x] Add GitHub Actions CI (lint + typecheck + test on push/PR)
- [ ] Auto-generate changelog from commits

## Phase 4: Dependency Updates (done)

- [x] Upgrade React 18 → 19
- [x] Upgrade TypeScript 4.5 → 6.0
- [x] Upgrade Electron 33 → 42
- [x] Upgrade antd 5 → 6
- [x] Upgrade nodemailer 6 → 9
- [x] Upgrade ESLint 8 → 9 (migrated to flat config `eslint.config.js`)
- [x] Upgrade typescript-eslint 5 → 8
- [x] Upgrade css-loader 6 → 7, style-loader 3 → 4, fork-ts-checker-webpack-plugin 7 → 9
- [x] Migrate CKEditor 5: replaced deprecated `@ckeditor/ckeditor5-build-classic` with `ckeditor5` package (NIM migration)
- [x] Migrate tsconfig: `module: esnext`, `moduleResolution: bundler`, explicit `rootDir: src`
- [x] Add `css.d.ts` for CSS side-effect imports
- [x] Fix all `any` types throughout the codebase
- [x] ESLint 10 not yet supported (eslint-plugin-import incompatibility) — using ESLint 9.x instead
