const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { expandPath, resolveWorkspaceDirectory, resolveActiveCwd } = require("../dist/stateManager.js");

test("expandPath expands tilde ~ to user home directory", () => {
  assert.equal(expandPath("~"), os.homedir());
  assert.equal(expandPath("~/Documents"), path.join(os.homedir(), "Documents"));
  assert.equal(expandPath("~\\Documents"), path.join(os.homedir(), "Documents"));
});

test("expandPath expands POSIX environment variables", () => {
  const originalHome = process.env.HOME;
  try {
    process.env.TEST_VAR = "my_custom_folder";
    assert.equal(expandPath("$TEST_VAR/sub"), "my_custom_folder/sub");
    assert.equal(expandPath("${TEST_VAR}/sub"), "my_custom_folder/sub");
  } finally {
    delete process.env.TEST_VAR;
    if (originalHome !== undefined) process.env.HOME = originalHome;
  }
});

test("expandPath expands Windows environment variables", () => {
  try {
    process.env.WIN_TEST = "win_folder";
    assert.equal(expandPath("%WIN_TEST%\\projects"), "win_folder\\projects");
  } finally {
    delete process.env.WIN_TEST;
  }
});

test("resolveWorkspaceDirectory resolves ~/Documents to absolute home path", () => {
  const resolved = resolveWorkspaceDirectory("~/Documents");
  assert.equal(resolved, path.resolve(os.homedir(), "Documents"));
  assert.equal(path.isAbsolute(resolved), true);
  assert.equal(resolved.includes(path.join("workspace", "~")), false);
});

test("resolveWorkspaceDirectory handles empty or undefined by using default workspace", () => {
  const defaultDir = path.join(os.homedir(), ".beledarians-llm-toolbox", "workspace");
  assert.equal(resolveWorkspaceDirectory(""), defaultDir);
  assert.equal(resolveWorkspaceDirectory(undefined), defaultDir);
});

test("resolveWorkspaceDirectory resolves truly relative paths relative to default workspace", () => {
  const defaultDir = path.join(os.homedir(), ".beledarians-llm-toolbox", "workspace");
  const resolved = resolveWorkspaceDirectory("subfolder/project");
  assert.equal(resolved, path.resolve(defaultDir, "subfolder/project"));
});

test("resolveActiveCwd updates CWD when user changes defaultWorkspacePath setting", () => {
  const configured = "/home/user/NewDocuments";
  const result = resolveActiveCwd(
    "/old/persisted/workspace",
    "/home/user/OldDocuments", // lastConfigured
    configured,                // rawConfigured
    configured                 // configuredDirectory
  );
  assert.equal(result, configured);
});

test("resolveActiveCwd preserves existing CWD if settings have not changed", () => {
  const configured = "/home/user/Documents";
  const customCwd = "/home/user/Documents/subproject";
  const result = resolveActiveCwd(
    customCwd,
    configured, // lastConfigured matches rawConfigured
    configured,
    configured
  );
  assert.equal(result, customCwd);
});

test("resolveActiveCwd self-heals corrupted CWD containing literal '~' path component", () => {
  const corruptedCwd = "/var/home/mni/.beledarians-llm-toolbox/workspace/~/Documents";
  const fixedTarget = "/var/home/mni/Documents";
  const result = resolveActiveCwd(
    corruptedCwd,
    "~/Documents", // lastConfigured was previously stored with ~
    "~/Documents", // rawConfigured is still ~/Documents
    fixedTarget    // newly resolved directory without literal ~
  );
  assert.equal(result, fixedTarget);
});

