import { ulid } from 'ulid';

export const type = {
  user: 'usr',
  store: 'str',
  event: 'ent',
} as const;

export const createId = (idType: keyof typeof type) =>
  [type[idType], ulid()].join('_');
