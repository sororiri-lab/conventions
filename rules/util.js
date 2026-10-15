/** 규칙들이 함께 쓰는 도구. */

/** 규칙 목록·붙이는 법·예외 정책이 있는 명세 (specmu 의 conventions 프로젝트). 규칙의 안내 링크는 여기로. */
export const DOCS = 'https://specmu.memomu.uk/conventions';

/** 클래스에 붙은 데코레이터 이름들 — `@Controller('x')` · `@Module({...})` · `@Injectable()` → ['Controller', …] */
export function decoratorNames(node) {
  return (node.decorators ?? []).map((d) => {
    const e = d.expression;
    if (e.type === 'CallExpression' && e.callee.type === 'Identifier') return e.callee.name;
    if (e.type === 'Identifier') return e.name;
    return null;
  });
}

export function decorator(node, name) {
  return (node.decorators ?? []).find((d) => {
    const e = d.expression;
    return (e.type === 'CallExpression' && e.callee.type === 'Identifier' && e.callee.name === name) ||
      (e.type === 'Identifier' && e.name === name);
  });
}
