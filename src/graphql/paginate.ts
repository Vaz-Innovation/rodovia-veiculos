import { type Result, tryCatch } from "@/lib/try-catch";

export interface PageResult<TNode> {
  nodes: TNode[];
  hasNextPage?: boolean | null;
  endCursor?: string | null;
}

export interface Collected<TNode> {
  nodes: TNode[];
  /** Set when a later page failed: `nodes` is what was collected before it. */
  error: Error | null;
}

/**
 * Walks a cursor-paginated connection and collects every node. `maxPages` is a
 * safety cap against a runaway loop.
 *
 * A failure on the first page throws (there is nothing to return). A failure on a
 * later page does NOT discard what was already collected: it is returned together
 * with the `error`, so the caller can use the partial list and let the missing
 * rest be filled in later (on-demand generation, a short-lived cache entry).
 */
export async function collectAllPages<TNode>(
  fetchPage: (after: string | null) => Promise<PageResult<TNode>>,
  maxPages: number,
): Promise<Collected<TNode>> {
  const nodes: TNode[] = [];
  // Widened on purpose: its narrowed type would depend on the previous page (circular).
  let after = null as string | null;

  for (let page = 0; page < maxPages; page++) {
    const [result, error]: Result<PageResult<TNode>> = await tryCatch(fetchPage(after));
    if (error) {
      if (nodes.length === 0) throw error;
      return { nodes, error };
    }

    nodes.push(...result.nodes);

    if (!result.hasNextPage || !result.endCursor) break;
    after = result.endCursor;
  }

  return { nodes, error: null };
}
