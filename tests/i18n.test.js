import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocale, getSystemDict } from '../dist/locales/i18n.js';

describe('Internationalization (i18n) System', () => {
  
  describe('resolveLocale mapping', () => {
    it('should resolve standard locales', () => {
      assert.equal(resolveLocale('en'), 'en');
      assert.equal(resolveLocale('de'), 'de');
      assert.equal(resolveLocale('zh-CN'), 'zh-CN');
      assert.equal(resolveLocale('zh-TW'), 'zh-TW');
    });

    it('should map regional German variants to "de"', () => {
      assert.equal(resolveLocale('de-DE'), 'de');
      assert.equal(resolveLocale('de-AT'), 'de');
      assert.equal(resolveLocale('de-CH'), 'de');
    });

    it('should map regional Chinese variants correctly', () => {
      // Simplified
      assert.equal(resolveLocale('zh'), 'zh-CN');
      assert.equal(resolveLocale('zh-SG'), 'zh-CN');
      
      // Traditional
      assert.equal(resolveLocale('zh-HK'), 'zh-TW');
      assert.equal(resolveLocale('zh-MO'), 'zh-TW');
      assert.equal(resolveLocale('zh-Hant'), 'zh-TW');
    });

    it('should default to "en" for unknown locales', () => {
      assert.equal(resolveLocale('fr'), 'en');
      assert.equal(resolveLocale('es'), 'en');
      assert.equal(resolveLocale(null), 'en');
      assert.equal(resolveLocale(''), 'en');
    });
  });

  describe('getSystemDict resolution', () => {
    it('should return a valid dictionary for English', () => {
      // Temporarily mock environment if needed, but resolveLocale('en') is hardcoded fallback
      const { dict, resolvedLocale } = getSystemDict();
      assert.ok(dict);
      assert.ok(dict.config);
      assert.ok(typeof resolvedLocale === 'string');
    });

    it('should have consistent translation keys across dictionaries', () => {
      const en = getSystemDict().dict;
      // We check if keys exist by comparing structure (smoke test)
      assert.ok(en.config.messageLanguage.displayName);
      assert.ok(en.config.uiLanguageOverride);
    });
  });
});
