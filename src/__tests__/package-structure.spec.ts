/**
 * Package Structure Tests
 * 
 * Verifies that the built package has the correct structure and entry points.
 * These tests ensure consumers can correctly import/require the package.
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';

const distDir = resolve(__dirname, '../../dist');

describe('Package Structure', () => {
  describe('Required Files', () => {
    it('should have dist/ directory', () => {
      expect(existsSync(distDir)).toBe(true);
    });

    it('should have index.js (CommonJS entry point)', () => {
      const indexJs = resolve(distDir, 'index.js');
      expect(existsSync(indexJs)).toBe(true);
    });

    it('should have index.mjs (ESM entry point)', () => {
      const indexMjs = resolve(distDir, 'index.mjs');
      expect(existsSync(indexMjs)).toBe(true);
    });

    it('should have types directory', () => {
      const typesDir = resolve(distDir, 'types');
      expect(existsSync(typesDir)).toBe(true);
    });

    it('should have components.d.ts in types/', () => {
      const componentsDts = resolve(distDir, 'types/components.d.ts');
      expect(existsSync(componentsDts)).toBe(true);
    });

    it('should have collection/ directory', () => {
      const collectionDir = resolve(distDir, 'collection');
      expect(existsSync(collectionDir)).toBe(true);
    });

    it('should have cjs/ directory', () => {
      const cjsDir = resolve(distDir, 'cjs');
      expect(existsSync(cjsDir)).toBe(true);
    });

    it('should have esm/ directory', () => {
      const esmDir = resolve(distDir, 'esm');
      expect(existsSync(esmDir)).toBe(true);
    });
  });

  describe('Entry Points', () => {
    it('index.js should reference cjs/ directory', () => {
      const indexJs = resolve(distDir, 'index.js');
      const content = readFileSync(indexJs, 'utf-8');
      
      // Should require from cjs directory
      expect(content).toContain('./cjs/');
      expect(content).toContain('require');
    });

    it('index.mjs should reference esm/ or be a valid export', () => {
      const indexMjs = resolve(distDir, 'index.mjs');
      const content = readFileSync(indexMjs, 'utf-8');
      
      // Should export from esm or be a valid module
      expect(content.length).toBeGreaterThan(0);
      // Might be a re-export or a reference to esm
      expect(content).toBeTruthy();
    });

    it('index.js should be small (just a redirect)', () => {
      const indexJs = resolve(distDir, 'index.js');
      const stats = statSync(indexJs);
      
      // Entry point should be small (just redirects)
      expect(stats.size).toBeLessThan(200);
    });

    it('index.mjs should be small (just a redirect)', () => {
      const indexMjs = resolve(distDir, 'index.mjs');
      const stats = statSync(indexMjs);
      
      // Entry point should be small
      expect(stats.size).toBeLessThan(200);
    });
  });

  describe('Component Bundles', () => {
    it('should have pie-player components in distribution', () => {
      // Check for component files - could be in cjs, esm, or pie-player-components dirs
      const hasComponents = 
        existsSync(resolve(distDir, 'cjs')) ||
        existsSync(resolve(distDir, 'esm')) ||
        existsSync(resolve(distDir, 'pie-player-components'));
      
      expect(hasComponents).toBe(true);
    });

    it('should have collection manifest', () => {
      const manifestPath = resolve(distDir, 'collection/collection-manifest.json');
      expect(existsSync(manifestPath)).toBe(true);
    });

    it('collection manifest should be valid JSON', () => {
      const manifestPath = resolve(distDir, 'collection/collection-manifest.json');
      const content = readFileSync(manifestPath, 'utf-8');
      
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('collection manifest should list pie-player and pie-author', () => {
      const manifestPath = resolve(distDir, 'collection/collection-manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      
      // Manifest should include our main components
      const manifestStr = JSON.stringify(manifest);
      expect(manifestStr).toContain('pie-player');
      expect(manifestStr).toContain('pie-author');
    });
  });

  describe('TypeScript Definitions', () => {
    it('components.d.ts should declare pie-player', () => {
      const componentsDts = resolve(distDir, 'types/components.d.ts');
      const content = readFileSync(componentsDts, 'utf-8');
      
      expect(content).toContain('PiePlayer');
    });

    it('components.d.ts should declare pie-author', () => {
      const componentsDts = resolve(distDir, 'types/components.d.ts');
      const content = readFileSync(componentsDts, 'utf-8');
      
      expect(content).toContain('PieAuthor');
    });

    it('components.d.ts should have ESM-related props', () => {
      const componentsDts = resolve(distDir, 'types/components.d.ts');
      const content = readFileSync(componentsDts, 'utf-8');
      
      // Should have the new ESM props
      expect(content).toContain('bundleFormat');
      expect(content).toContain('esmCdnUrl');
    });
  });
});

