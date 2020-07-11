import { FindManyOptions } from 'typeorm';

export default function removeEmpty<T>(obj: FindManyOptions<T>): FindManyOptions<T> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => (typeof v === 'object' && !v._type ? [k, removeEmpty(v)] : [k, v]))
      .filter(([_, v]) => Object.keys(v).length),
  );
}
