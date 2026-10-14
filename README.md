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

## References

- [GitHub standard runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [Playwright library](https://playwright.dev/docs/library)
