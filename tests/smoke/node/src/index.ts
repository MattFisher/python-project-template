// Deliberately typed: `tsc --noEmit` passing on an empty project would prove
// nothing about whether node-ci actually ran the type-checker.
export function greet(name: string): string {
  return `hello, ${name}`;
}
