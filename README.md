# r04 automatic dependency setup

Latest run: https://github.com/sfruccwt/html-export-macos-test/actions/runs/38556677653 (success). On macOS 15.7.9 arm64, with Node absent from PATH and fresh dependency/browser caches, the packaged bootstrap installed Node24.21.0, Playwright1.64.0 and Chromium. Second invocation reused all dependencies. Both/png-only/jpg-only image checks passed. WorkBuddy Mac desktop was not tested.

## Earlier r03 results

# HTML export macOS test

Tests the shared `html-export-skill-20261014-r03.zip` on a standard GitHub macOS
runner. The workflow is manual only, uses `macos-15` (Apple Silicon), and has a
15-minute timeout. Standard hosted runner compute is free for public repositories.
It uploads no caches or artifacts; generated synthetic images are returned through
job logs for local visual inspection. Logs do not count towards artifact storage.

Published inputs are only the reusable Skill ZIP, a synthetic HTML demo, the test
workflow, and its image verifier. No account credentials or local runtime
configuration are included.

The test unpacks the exact ZIP, installs Node 24, Playwright/Chromium and Pillow,
then exports both formats, PNG only, and JPG only. It checks image decoding,
1280x2400 pixels, transparent PNG corners, white JPG corners, and the absence of
unrequested formats. Runtime versions and actual OS/architecture appear in logs.

## Scope

This checks the Skill's packaged rendering script on macOS. WorkBuddy desktop
installation, login, ZIP import, and natural-language invocation on a Mac require
a separate Mac client test. Chinese text and layout require visual inspection of
the generated images after the workflow completes.

## Verified result: 2026-10-14

[Run 38532796660](https://github.com/sfruccwt/html-export-macos-test/actions/runs/38532796660)
passed on macOS 15.7.9 arm64, Node 24.20.0, Playwright 1.64.0, and Chromium
156.0.8078.4. Both formats and both individual-format requests passed. All images
were 1280x2400; PNG corners were transparent and JPG corners white. The PNG/JPG
pair was retrieved from logs and visually checked: Chinese title, embedded image,
excluded editor and complete footer were correct. The packaged script needed no
changes. WorkBuddy Mac desktop import and invocation remain untested.

## References

- [GitHub standard runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Playwright library](https://playwright.dev/docs/library)
