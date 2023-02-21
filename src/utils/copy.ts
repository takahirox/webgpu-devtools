type Copyable = string | number | boolean | object | null | undefined;
export type NestedCopyable = Copyable | Array<Copyable> | Array<NestedCopyable>;

export const deepCopy = (data: NestedCopyable): NestedCopyable => {
  if (Array.isArray(data)) {
    return data.map(deepCopy);
  }
  if (data instanceof ArrayBuffer) {
    return data;
  }
  if (typeof data === 'object') {
    const obj: Record<string, NestedCopyable> = {};
    for (const key in data) {
      obj[key] = deepCopy(data[key as keyof object]);
    }
    return obj;
  }
  return data;
};
