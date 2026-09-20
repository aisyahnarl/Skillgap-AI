/**
 * Bab 10: Optimasi Performa & Core Web Vitals (INP <= 200ms)
 * Utilitas Task Chunking menggunakan scheduler.yield() dengan fallback graceful.
 * Mencegah blocking main thread saat kalkulasi komparasi skill, matching, atau pemrosesan batch data.
 */

declare global {
  interface Window {
    scheduler?: {
      yield?: () => Promise<void>;
    };
  }
}

/**
 * Menyerahkan kontrol kembali ke event loop peramban (browser main thread)
 * agar interaksi pengguna (klik, ketikan, input) dapat diproses segera tanpa lag (INP <= 200ms).
 */
export async function yieldTask(): Promise<void> {
  if (typeof window !== 'undefined' && typeof window.scheduler?.yield === 'function') {
    await window.scheduler.yield();
    return;
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Memproses array data dalam beberapa potongan (chunks) dengan yieldTask
 * di setiap interval chunk agar tidak memblokir perenderan UI.
 */
export async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processItem: (item: T, index: number) => R,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item !== undefined) {
      results.push(processItem(item, i));
    }
    if ((i + 1) % chunkSize === 0 && i + 1 < items.length) {
      await yieldTask();
    }
  }
  return results;
}
