export function cls(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
