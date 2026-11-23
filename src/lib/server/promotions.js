import { assertUnique, createCrud } from './crud';

export function promotionCrud(schema) {
  return createCrud({
    collection: 'promotions',
    schema,
    prepare: async (data, { id, db }) => {
      await assertUnique(db, 'promotions', 'code', data.code, id, 'Ya existe una promoción con ese código.');
      return data;
    },
    sort: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  });
}
