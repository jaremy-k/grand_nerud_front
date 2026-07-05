export function insertAtCursor(
  value: string,
  insert: string,
  selectionStart: number,
  selectionEnd: number
): { newValue: string; newCursor: number } {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const newValue = before + insert + after;
  const newCursor = selectionStart + insert.length;
  return { newValue, newCursor };
}

export function getFunctionInsert(name: string): string {
  return `${name}()`;
}
