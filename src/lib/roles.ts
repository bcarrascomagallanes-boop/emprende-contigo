export type AppRole = 'admin' | 'emprendedor' | 'cliente';
/** Admin wins over every other role; roles come only from the server. */
export function primaryRole(roles: string[]): AppRole | null {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('emprendedor')) return 'emprendedor';
  if (roles.includes('cliente')) return 'cliente';
  return null;
}
/** The signup form may only request these roles; admin is never self-assigned. */
export function signupRole(value: string): 'cliente' | 'emprendedor' {
  return value === 'emprendedor' ? 'emprendedor' : 'cliente';
}
