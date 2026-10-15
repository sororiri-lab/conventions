import { decoratorNames, DOCS } from './util.js';

/**
 * 역할이 이름 끝에 드러나게 한다.
 *  - `@Controller` 클래스는 …Controller
 *  - `*.service.ts` 의 `@Injectable` 클래스는 …Service (가드·파이프 등 다른 @Injectable 은 대상이 아니다)
 */
export default {
  meta: {
    type: 'suggestion',
    docs: { description: '컨트롤러는 …Controller, 서비스는 …Service 로 이름을 끝낸다', url: DOCS },
    schema: [],
    messages: {
      controller: '@Controller 클래스 이름은 Controller 로 끝난다: {{name}}',
      service: '*.service.ts 의 @Injectable 클래스 이름은 Service 로 끝난다: {{name}}',
    },
  },
  create(context) {
    const isServiceFile = context.filename.endsWith('.service.ts');
    return {
      ClassDeclaration(node) {
        if (!node.id) return;
        const names = decoratorNames(node);
        const name = node.id.name;
        if (names.includes('Controller') && !name.endsWith('Controller')) {
          context.report({ node: node.id, messageId: 'controller', data: { name } });
        }
        if (isServiceFile && names.includes('Injectable') && !name.endsWith('Service')) {
          context.report({ node: node.id, messageId: 'service', data: { name } });
        }
      },
    };
  },
};
