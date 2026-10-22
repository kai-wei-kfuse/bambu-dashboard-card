/** Lit inserts option lists after attributes; native selection must follow the finished list. */
export function syncSelectValues(root: ParentNode): void {
  for (const select of root.querySelectorAll<HTMLSelectElement>('select[data-value]')) {
    const value = select.dataset.value!;
    if (select.value !== value) select.value = value;
  }
}
