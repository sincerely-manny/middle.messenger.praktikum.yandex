// typescript/parcel hack для импорта шаблонов (чтоб TS не ругался)
// eslint-disable-next-line import/no-unresolved
export const tmpl = import('../templates/*/*.tbt');
export default { tmpl };
