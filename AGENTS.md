# AGENTS.md

## Commands

- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Start (dev)**: `npm start`
- **Build**: `npm run make`

## Project Structure

- `src/index.ts` — Electron main process (window creation, IPC registration)
- `src/preload.ts` — Preload script (exposes IpcService to renderer)
- `src/renderer.ts` — Webpack renderer entry point
- `src/app.tsx` — React root
- `src/frontend/` — React components (App, Recipients, Content, Attachments, Settings, Confirmation)
- `src/IPC/` — IPC channel handlers (SendMailChannel, SystemInfoChannel)
- `src/shared/` — Shared types and utilities (MailMessageType, IpcRequest, htmlToPlainText, storage)
- `forge.config.ts` — Electron Forge configuration
- `webpack.*.config.ts` — Webpack configurations

## Conventions

- TypeScript with React 18 + Ant Design 5
- IPC pattern: renderer calls `window.IpcService.send(channel, { params })` → main process handles via `IpcChannelInterface`
- Form state persisted in `localStorage` (see `src/shared/storage.ts`)
- Template variables use `##fieldname##` syntax
