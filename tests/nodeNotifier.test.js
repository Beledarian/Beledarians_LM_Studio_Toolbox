const test = require("node:test");
const assert = require("node:assert/strict");

// Regression test for issue #26: "notifier.notify is not a function"
// When using dynamic import() with CommonJS modules like node-notifier,
// the exports are available on the .default property.
test("node-notifier dynamic import exposes notify on .default", async () => {
  const notifier = await import("node-notifier");

  // Verify that .default exists and has a notify function
  assert.ok(notifier.default, "node-notifier should have a .default export");
  assert.equal(
    typeof notifier.default.notify,
    "function",
    "notifier.default.notify should be a function"
  );

  // This is the pattern used in toolsProvider.ts after the fix:
  // notifier.default.notify({ title, message, ... })
  // Ensure calling it doesn't throw (we won't actually show a notification)
  assert.doesNotThrow(() => {
    notifier.default.notify({
      title: "Test",
      message: "Regression test for #26",
      wait: false,
      sound: false,
    });
  }, "notifier.default.notify() should not throw");
});

test("node-notifier dynamic import does NOT expose notify directly on module", async () => {
  const notifier = await import("node-notifier");

  // This was the bug: calling notifier.notify() instead of notifier.default.notify()
  // The direct .notify property may be undefined or not a function in ESM interop
  assert.ok(
    typeof notifier.notify !== "function" || notifier.notify === notifier.default.notify,
    "Direct notifier.notify should either not exist or be the same as .default.notify"
  );
});
