export function cls(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
