export function checkIsValidValueForControlledReactForm(obj, key): boolean {
  return Reflect.has(obj, key) && obj[key] !== undefined && obj[key] !== null;
}