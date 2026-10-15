import { DOCS } from './util.js';

/**
 * 컨트롤러에서 SQL 을 쓰지 않는다 — 쿼리는 서비스에 둔다.
 * `*.controller.ts` 의 문자열·템플릿 문자열이 SQL 문장으로 시작하면 걸린다.
 * 키워드 하나로는 판단하지 않는다 (`'Update failed'` 는 SQL 이 아니다) — 짝이 되는 키워드까지 본다.
 */
const SQL = [
  /^\s*select\b[\s\S]*\bfrom\b/i,
  /^\s*insert\s+into\b/i,
  /^\s*update\s+\S+[\s\S]*\bset\b/i,
  /^\s*delete\s+from\b/i,
  /^\s*with\s+\S+\s+as\s*\(/i,
];

export default {
  meta: {
    type: 'suggestion',
    docs: { url: DOCS, description: '컨트롤러에서 SQL 을 쓰지 않는다' },
    schema: [],
    messages: { sql: '컨트롤러에서 SQL 을 쓰지 않는다 — 쿼리는 서비스로 옮긴다.' },
  },
  create(context) {
    if (!context.filename.endsWith('.controller.ts')) return {};
    const check = (node, text) => {
      if (SQL.some((re) => re.test(text))) context.report({ node, messageId: 'sql' });
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateLiteral(node) {
        check(node, node.quasis.map((q) => q.value.cooked ?? q.value.raw).join(' '));
      },
    };
  },
};
