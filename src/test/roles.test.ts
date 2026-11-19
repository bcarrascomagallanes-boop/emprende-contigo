import { describe, expect, it } from 'vitest';
import { primaryRole, signupRole } from '@/lib/roles';
describe('Roles', () => {
  it('administrator wins over entrepreneur', () => expect(primaryRole(['emprendedor', 'admin'])).toBe('admin'));
  it('entrepreneur wins over customer', () => expect(primaryRole(['cliente', 'emprendedor'])).toBe('emprendedor'));
  it('no roles means no access', () => expect(primaryRole([])).toBeNull());
  it('signup cannot request administrator', () => expect(signupRole('admin')).toBe('cliente'));
  it('signup can request entrepreneur', () => expect(signupRole('emprendedor')).toBe('emprendedor'));
});
