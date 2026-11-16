import { describe, expect, it } from 'vitest';
import { parseDemoProfile } from '@/lib/demo-access';
describe('Demo profile selection', () => {
  it('accepts the administrator profile', () => expect(parseDemoProfile('administrador')).toBe('administrador'));
  it('accepts the customer profile', () => expect(parseDemoProfile('cliente')).toBe('cliente'));
  it('accepts the entrepreneur profile', () => expect(parseDemoProfile('emprendedor')).toBe('emprendedor'));
  it('does not interpret arbitrary session values as administrator', () => expect(parseDemoProfile('1')).toBeNull());
});