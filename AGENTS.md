---
name: chat_plugin_agent
description: Maintainer for the Yelda website chat injector plugin (webpack + browser API + Mocha).
---

## Overview

- Browser plugin library that injects Yelda webchat into a host website.
- Main public API is the `yeldaChat` browser object exported from `src/js/yeldaWebchatInjector.js`.
- Bundled with webpack and shipped as JS/CSS assets in `dist/`.
- Tests use Mocha, Chai, jsdom, and xhr-mock.
- Upload/publish flow is handled by `uploadBuildToS3.js`.

## Setup

- Node: use Node.js >=10.12.0 (Mocha 8.x requires >=10.12.0).
- Install deps: `npm install`
- Build: `npm run build`
- Test: `npm test`

## Key Scripts

- `npm run build` builds the browser bundle into `dist/`.
- `npm run test` runs the Mocha suite against the built artifact.
- `npm run lint:check` runs ESLint on `src/`.
- `npm run lint:fix` auto-fixes ESLint issues in `src/`.
- `npm run uploadBuildToS3` builds, tests, uploads assets to S3, updates the package version, and pushes the version commit.

## Env Vars

- `AWS_REGION`: S3 region used by `uploadBuildToS3.js`.
- `AWS_BUCKET`: target bucket for uploaded build assets.
- `AWS_ACCESS_KEY_ID`: AWS credential required for upload.
- `AWS_SECRET_ACCESS_KEY`: AWS credential required for upload.
- `.env` is loaded by `uploadBuildToS3.js` through `dotenv`.

## Code Layout

- `src/js/yeldaWebchatInjector.js`: primary implementation of the injected chat widget and public API.
- `src/config/index.js`: constants, host rules, and iframe frame event names.
- `src/css/yeldaWebchatInjector.css`: widget styling.
- `test/test.js`: Mocha + jsdom integration-style tests that import the built bundle from `dist/`.
- `webpack.config.js`: production build config for JS, CSS, and compressed outputs.
- `uploadBuildToS3.js`: packaging, S3 upload, git push, and npm publish flow.
- `README.md`: public usage and maintenance notes.

## Behavior Gotchas

- `test/test.js` requires a fresh `npm run build` because it imports `../dist/js/yeldaWebchatInjector.min`.
- `yeldaChat` is exposed both as the default export and on `window.yeldaChat`.
- `FRAME_EVENT_TYPES.SENT.UPDATE_SLOT` is part of the public iframe protocol and must stay aligned with `updateSlot()` behavior.
- `parentContainerId`, `bubbleContainerChildId`, and `canBeClosed` affect DOM placement, visibility, and closing behavior.
- External assistant settings are loaded from `https://webchat.yelda.ai/webchat`, with fallback logic to Yelda domains in `src/js/yeldaWebchatInjector.js`.
- `setAssistantUrl`, `getAppEnv`, and `formatData` drive environment resolution, URL normalization, and default init behavior.
- `unLoadChat()` and `resetChat()` are part of the lifecycle used by `init()` and `setupChat()`.

## Coding Style & Conventions

- Follow the existing code style in the repo: 2-space indentation, single quotes, no semicolons, and no trailing commas.
- Keep ESLint rules intact, especially `no-console` restrictions and `require-await`.
- Use the webpack alias `@` for `src/` imports when it keeps paths clearer.
- Prefer camelCase for variables and functions, PascalCase for classes/constructors, and keep filenames consistent with existing modules.
- Keep function names verb-driven when adding new helpers.
- Use small helpers instead of long inline logic when changing the injector.
- Avoid deep nesting; prefer early returns and straightforward control flow.
- Do not declare new functions inside other functions unless there is a strong local reason.
- Add or update JSDoc for new helper functions, and keep existing JSDoc accurate when behavior or parameters change.
- Avoid magic numbers when a value belongs in `src/config/index.js`.
- Prefer reusing existing helpers and shared logic instead of introducing new ones.
- Do not add new dependencies or delete files without asking first.
- Document any new env vars or endpoint changes in `README.md`.

## Testing & Quality

- Run `npm test` after changes that affect the bundle or runtime behavior.
- Run `npm run lint:check` after code changes.
- Re-run the relevant test/lint command after editing code or tests, and say explicitly if you could not run them.
- When updating protocol constants or iframe message handling, add or update tests in `test/test.js`.

## Working Agreements

- Preserve the current build and publish flow unless the user asks to change it.
- Keep changes focused on the plugin runtime and its documented maintenance workflow.
- Leave unrelated local edits alone unless they directly block the task.
