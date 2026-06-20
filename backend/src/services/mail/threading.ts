/**
 * Pure RFC 5322 email-threading helpers (no DB/IO) so they can be unit-tested
 * and reasoned about in isolation. ticketMail composes these with repository
 * reads to thread outbound mail onto an existing ticket conversation.
 */
import { randomUUID } from 'crypto';

/**
 * Build the References chain for a reply: the thread root (if any) followed by
 * every prior Message-ID, de-duplicated and order-preserving. In-Reply-To is the
 * most recent message in the chain.
 */
export function buildReferenceChain(rootId: string | null, priorIds: (string | null)[]): {
  references: string[];
  inReplyTo?: string;
} {
  const chain: string[] = [];
  if (rootId) chain.push(rootId);
  for (const id of priorIds) {
    if (id && !chain.includes(id)) chain.push(id);
  }
  return { references: chain, inReplyTo: chain.length ? chain[chain.length - 1] : undefined };
}

/** Generate a Message-ID rooted on the sender address's domain. */
export function generateMessageId(fromAddress: string): string {
  const at = fromAddress.lastIndexOf('@');
  const domain = at >= 0 ? fromAddress.slice(at + 1).replace(/[>\s].*$/, '').trim() : '';
  return `<${randomUUID()}@${domain || 'anchordesk.local'}>`;
}
