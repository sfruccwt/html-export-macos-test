import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const expectedConfig = path.join(os.homedir(), 'Library/Caches/html-export/runtime.json');
const results = [];
for (const [variant, formats] of [['both', ['png', 'jpg']], ['png-only', ['png']], ['jpg-only', ['jpg']]]) {
  const receipt = JSON.parse(fs.readFileSync(`output/${variant}/demo-export-receipt.json`, 'utf8'));
  assert.equal(receipt.skillVersion, 'r06');
  assert.equal(receipt.status, 'completed');
  assert.equal(receipt.verification.status, 'passed');
  assert.equal(receipt.runtimeConfig, expectedConfig);
  assert.deepEqual(receipt.files.map(file => file.format), formats);
  assert.deepEqual(fs.readdirSync(`output/${variant}`).filter(name => /\.(png|jpg)$/.test(name)).sort(), formats.map(format => `demo.${format}`).sort());
  for (const file of receipt.verification.files) {
    assert.equal(file.decoded, true);
    assert.equal(file.width, 1280);
    assert.equal(file.height, 2400);
    assert.equal(file.hasTransparentPixels, file.format === 'png');
  }
  results.push({variant, status: receipt.status, verification: receipt.verification, runtimeConfig: receipt.runtimeConfig, node: receipt.nodeVersion, browser: receipt.browserVersion, seconds: (Date.parse(receipt.finishedUtc) - Date.parse(receipt.startedUtc)) / 1000});
}
console.log('R06_MAC_RESULTS=' + JSON.stringify(results));
