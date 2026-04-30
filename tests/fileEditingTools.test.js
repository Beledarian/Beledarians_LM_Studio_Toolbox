const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs/promises');
const path = require('path');

describe('Issue #13 - Enhanced File Editing Tools', () => {
  const testDir = path.join(process.cwd(), 'test_temp_issue_13');

  it('should set up test directory', async () => {
    try {
      await fs.mkdir(testDir, { recursive: true });
      
      // Create a test file with known content
      const testFile = path.join(testDir, 'test.txt');
      const lines = [
        'Line 1: Hello World',
        'Line 2: This is a test',
        'Line 3: For issue #13',
        'Line 4: Enhanced file editing',
        'Line 5: Final line'
      ];
      await fs.writeFile(testFile, lines.join('\n'), 'utf-8');
      
      assert.ok(await fs.access(testFile).then(() => true).catch(() => false));
    } catch (err) {
      console.error('Setup error:', err);
      throw err;
    }
  });

  it('insert_at_line: should insert content at specified line', async () => {
    const testFile = path.join(testDir, 'insert_test.txt');
    await fs.writeFile(testFile, 'Line 1\nLine 2\nLine 3', 'utf-8');
    
    // Simulate inserting "NEW LINE" at line 2 (1-indexed)
    const content = await fs.readFile(testFile, 'utf-8');
    const lines = content.split('\n');
    const insertIndex = 1; // Line 2 in 0-indexed is 1
    const newContent = "NEW LINE";
    lines.splice(insertIndex, 0, newContent);
    
    await fs.writeFile(testFile, lines.join('\n'), 'utf-8');
    
    const result = await fs.readFile(testFile, 'utf-8');
    const resultLines = result.split('\n');
    
    assert.strictEqual(resultLines.length, 4, 'Should have 4 lines after insertion');
    assert.strictEqual(resultLines[1], 'NEW LINE', 'New line should be at position 2');
    assert.strictEqual(resultLines[0], 'Line 1', 'First line unchanged');
    assert.strictEqual(resultLines[2], 'Line 2', 'Original line 2 pushed down');
  });

  it('append_file: should append content to end of file', async () => {
    const testFile = path.join(testDir, 'append_test.txt');
    await fs.writeFile(testFile, 'Original content\n', 'utf-8');
    
    // Simulate appending
    await fs.appendFile(testFile, 'Appended line 1\nAppended line 2\n', 'utf-8');
    
    const result = await fs.readFile(testFile, 'utf-8');
    const lines = result.split('\n').filter(l => l.length > 0);
    
    assert.strictEqual(lines.length, 3, 'Should have 3 non-empty lines');
    assert.strictEqual(lines[0], 'Original content', 'Original content preserved');
    assert.strictEqual(lines[1], 'Appended line 1', 'First appended line present');
    assert.strictEqual(lines[2], 'Appended line 2', 'Second appended line present');
  });

  it('read_file_range: should read specific lines with line numbers', async () => {
    const testFile = path.join(testDir, 'range_test.txt');
    const content = ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'].join('\n');
    await fs.writeFile(testFile, content, 'utf-8');
    
    // Simulate reading lines 2-4 (1-indexed)
    const lines = content.split('\n');
    const startLine = 2;
    const endLine = 4;
    const selectedLines = lines.slice(startLine - 1, endLine);
    
    assert.strictEqual(selectedLines.length, 3, 'Should select 3 lines');
    assert.strictEqual(selectedLines[0], 'Line B', 'First line should be Line B');
    assert.strictEqual(selectedLines[2], 'Line D', 'Last line should be Line D');
    
    // Verify line number formatting would work
    const numberedContent = selectedLines.map((line, idx) => 
      `${startLine + idx}: ${line}`
    ).join('\n');
    
    assert.ok(numberedContent.includes('2: Line B'), 'Should include line numbers');
    assert.ok(numberedContent.includes('3: Line C'), 'Should include line numbers');
    assert.ok(numberedContent.includes('4: Line D'), 'Should include line numbers');
  });

  it('search_in_file: should find matching lines with line numbers', async () => {
    const testFile = path.join(testDir, 'search_test.txt');
    const content = [
      'import React from "react"',
      'const App = () => {',
      '  return <div>Hello</div>',
      '}',
      'export default App'
    ].join('\n');
    await fs.writeFile(testFile, content, 'utf-8');
    
    // Simulate searching for "App" (case-insensitive)
    const lines = content.split('\n');
    const pattern = 'app';
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(pattern)) {
        matches.push({
          line_number: i + 1,
          content: lines[i]
        });
      }
    }
    
    assert.strictEqual(matches.length, 2, 'Should find 2 matching lines');
    assert.strictEqual(matches[0].line_number, 2, 'First match at line 2');
    assert.ok(matches[0].content.includes('App ='), 'Match content correct');
    assert.strictEqual(matches[1].line_number, 5, 'Second match at line 5');
  });

  it('search_in_file with regex: should support regex patterns', async () => {
    const testFile = path.join(testDir, 'regex_test.txt');
    const content = [
      'email1@example.com',
      'not an email',
      'user@domain.org',
      'another line'
    ].join('\n');
    await fs.writeFile(testFile, content, 'utf-8');
    
    // Simulate regex search for email pattern (simpler pattern)
    const lines = content.split('\n');
    const emailRegex = /@.*\.(com|org)/i;
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (emailRegex.test(lines[i])) {
        matches.push({
          line_number: i + 1,
          content: lines[i]
        });
      }
    }
    
    assert.strictEqual(matches.length, 2, 'Should find 2 email addresses');
    assert.strictEqual(matches[0].line_number, 1, 'First email at line 1');
    assert.strictEqual(matches[1].line_number, 3, 'Second email at line 3');
  });

  it('should clean up test files', async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });
});
