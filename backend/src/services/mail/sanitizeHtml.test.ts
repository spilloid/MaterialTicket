import { sanitizeEmailHtml, htmlToText } from './sanitizeHtml';

describe('sanitizeEmailHtml', () => {
  it('keeps common formatting tags', () => {
    const out = sanitizeEmailHtml('<p>Hello <strong>world</strong> and <em>all</em></p>');
    expect(out).toContain('<strong>world</strong>');
    expect(out).toContain('<em>all</em>');
  });

  it('strips <script> tags and their content', () => {
    const out = sanitizeEmailHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toMatch(/script/i);
    expect(out).toContain('<p>hi</p>');
  });

  it('removes inline event handlers', () => {
    const out = sanitizeEmailHtml('<a href="https://x.com" onclick="steal()">x</a>');
    expect(out).not.toMatch(/onclick/i);
    expect(out).toContain('href="https://x.com"');
  });

  it('drops javascript: URIs', () => {
    const out = sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it('forces external links to open safely', () => {
    const out = sanitizeEmailHtml('<a href="https://x.com">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('blocks non-https image sources (e.g. cid: inline attachments)', () => {
    const out = sanitizeEmailHtml('<img src="cid:logo123">');
    expect(out).not.toMatch(/cid:/);
  });

  it('returns empty string for falsy input', () => {
    expect(sanitizeEmailHtml('')).toBe('');
  });
});

describe('htmlToText', () => {
  it('strips all markup to plain text', () => {
    expect(htmlToText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('decodes non-breaking spaces', () => {
    expect(htmlToText('<p>a&nbsp;b</p>')).toBe('a b');
  });
});
