import { decoratorNames, DOCS } from './util.js';

/**
 * 파일은 역할마다 하나 — 파일 이름만 보고 무엇이 어디 있는지 알 수 있어야 한다.
 *  - `@Module` 과 `@Controller` 를 한 파일에 두지 않는다
 *  - 한 파일에 컨트롤러는 하나
 *  - DTO 클래스(이름이 …Dto)는 `*.dto.ts` 나 `dto/` 폴더에 둔다
 */
export default {
  meta: {
    type: 'suggestion',
    docs: { url: `${DOCS}/pages/f333b6b0-1f94-4972-b498-6f78e190f6f9`, description: '컨트롤러·서비스·모듈·DTO 를 역할마다 다른 파일에 둔다' },
    schema: [],
    messages: {
      moduleWithController: '@Module 과 @Controller 를 한 파일에 두지 않는다 — {{name}} 을(를) 따로 *.controller.ts 로 옮긴다.',
      manyControllers: '한 파일에 컨트롤러는 하나 — {{name}} 을(를) 따로 *.controller.ts 로 옮긴다.',
      dtoOutside: 'DTO({{name}})는 *.dto.ts 나 dto/ 폴더에 둔다.',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/');
    const dtoPlace = /\.dto\.ts$/.test(filename) || /\/dto\//.test(filename);
    const modules = [];
    const controllers = [];
    return {
      ClassDeclaration(node) {
        const names = decoratorNames(node);
        if (names.includes('Module')) modules.push(node);
        if (names.includes('Controller')) controllers.push(node);
        if (node.id && /Dto$/.test(node.id.name) && !dtoPlace) {
          context.report({ node: node.id, messageId: 'dtoOutside', data: { name: node.id.name } });
        }
      },
      'Program:exit'() {
        if (modules.length) {
          for (const c of controllers) context.report({ node: c.id ?? c, messageId: 'moduleWithController', data: { name: c.id?.name ?? '컨트롤러' } });
        } else {
          for (const c of controllers.slice(1)) context.report({ node: c.id ?? c, messageId: 'manyControllers', data: { name: c.id?.name ?? '컨트롤러' } });
        }
      },
    };
  },
};
