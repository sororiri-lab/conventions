import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { decorator, DOCS } from './util.js';

/**
 * 모듈에 필요한 파일이 있는가 — `<기능>.module.ts` 를 검사할 때 같은 폴더를 함께 본다.
 *  - API 를 내는 모듈(@Module 의 controllers 가 비어 있지 않다): *.controller.ts · <기능>.service.ts · <기능>.dto.ts(또는 dto/)
 *  - 내부 모듈(controllers 가 없다): <기능>.service.ts
 *  - 뿌리 모듈 app.module.ts 는 보지 않는다
 *
 * ⚠️ 다른 파일이 지워져도 모듈 파일은 그대로라, ESLint 캐시(--cache)를 켜면 다시 검사하지 않아 놓친다.
 */
export default {
  meta: {
    type: 'problem',
    docs: { description: '모듈 폴더에 controller·service·dto 파일이 있어야 한다', url: DOCS },
    schema: [],
    messages: {
      missing: '{{feature}} 모듈에 필요한 파일이 없다: {{files}}',
    },
  },
  create(context) {
    const filename = context.filename;
    if (!filename.endsWith('.module.ts')) return {};
    const dir = dirname(filename);
    const feature = basename(filename, '.module.ts');
    // 뿌리 모듈(AppModule)은 기능이 아니라 다른 모듈을 묶는 자리다
    if (feature === 'app') return {};
    return {
      ClassDeclaration(node) {
        const mod = decorator(node, 'Module');
        if (!mod) return;
        const arg = mod.expression.type === 'CallExpression' ? mod.expression.arguments[0] : null;
        const controllersProp = arg?.type === 'ObjectExpression'
          ? arg.properties.find((p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'controllers')
          : null;
        const api = controllersProp?.value.type === 'ArrayExpression' && controllersProp.value.elements.length > 0;

        const files = readdirSync(dir);
        const missing = [];
        if (!files.includes(`${feature}.service.ts`)) missing.push(`${feature}.service.ts`);
        if (api) {
          if (!files.some((f) => f.endsWith('.controller.ts'))) missing.push('*.controller.ts');
          const dtoDir = join(dir, 'dto');
          if (!files.includes(`${feature}.dto.ts`) && !(existsSync(dtoDir) && statSync(dtoDir).isDirectory())) {
            missing.push(`${feature}.dto.ts (또는 dto/)`);
          }
        }
        if (missing.length) context.report({ node: mod, messageId: 'missing', data: { feature, files: missing.join(', ') } });
      },
    };
  },
};
