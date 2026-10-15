import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import { resolve } from 'node:path';
import tseslint from 'typescript-eslint';
import classSuffix from '../rules/class-suffix.js';
import filePerRole from '../rules/file-per-role.js';
import requiredFiles from '../rules/required-files.js';

RuleTester.describe = describe;
RuleTester.it = it;
const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });
const fx = (p) => resolve(import.meta.dirname, 'fixtures', p);

tester.run('file-per-role', filePerRole, {
  valid: [
    { filename: 'src/notes/notes.controller.ts', code: "@Controller('notes') export class NotesController {}" },
    { filename: 'src/notes/notes.module.ts', code: '@Module({ controllers: [NotesController] }) export class NotesModule {}' },
    { filename: 'src/notes/notes.dto.ts', code: 'export class CreateNoteDto {} export class NoteDto {}' },
    { filename: 'src/notes/dto/create-note.ts', code: 'export class CreateNoteDto {}' },
  ],
  invalid: [
    {
      filename: 'src/projects/projects.module.ts',
      code: "@Controller('projects') export class ProjectsController {}\n@Module({ controllers: [ProjectsController] }) export class ProjectsModule {}",
      errors: [{ messageId: 'moduleWithController' }],
    },
    {
      filename: 'src/projects/projects.controller.ts',
      code: "@Controller('projects') export class ProjectsController {}\n@Controller('public') export class PublicController {}",
      errors: [{ messageId: 'manyControllers' }],
    },
    {
      filename: 'src/auth/auth.controller.ts',
      code: "export class SignupDto {}\n@Controller('auth') export class AuthController {}",
      errors: [{ messageId: 'dtoOutside' }],
    },
  ],
});

tester.run('required-files', requiredFiles, {
  valid: [
    { filename: fx('api-ok/notes.module.ts'), code: '@Module({ controllers: [NotesController], providers: [NotesService] }) export class NotesModule {}' },
    { filename: fx('api-dtodir/notes.module.ts'), code: '@Module({ controllers: [NotesController] }) export class NotesModule {}' },
    { filename: fx('internal-ok/db.module.ts'), code: '@Global() @Module({ providers: [Db], exports: [Db] }) export class DbModule {}' },
    { filename: fx('api-missing/notes.controller.ts'), code: "@Controller('x') export class NotesController {}", name: '모듈 파일이 아니면 보지 않는다' },
    { filename: fx('api-missing/app.module.ts'), code: '@Module({ imports: [NotesModule] }) export class AppModule {}', name: '뿌리 모듈은 보지 않는다' },
  ],
  invalid: [
    {
      filename: fx('api-missing/notes.module.ts'),
      code: '@Module({ controllers: [NotesController] }) export class NotesModule {}',
      errors: [{ messageId: 'missing', data: { feature: 'notes', files: 'notes.service.ts, *.controller.ts, notes.dto.ts (또는 dto/)' } }],
    },
    {
      filename: fx('api-missing/notes.module.ts'),
      code: '@Module({ providers: [] }) export class NotesModule {}',
      errors: [{ messageId: 'missing', data: { feature: 'notes', files: 'notes.service.ts' } }],
      name: '내부 모듈은 service 만 요구한다',
    },
  ],
});

tester.run('class-suffix', classSuffix, {
  valid: [
    { filename: 'src/notes/notes.controller.ts', code: "@Controller('notes') export class NotesController {}" },
    { filename: 'src/notes/notes.service.ts', code: '@Injectable() export class NotesService {}' },
    { filename: 'src/auth/auth.guard.ts', code: '@Injectable() export class AuthGuard {}', name: '서비스 파일이 아닌 @Injectable 은 대상이 아니다' },
  ],
  invalid: [
    { filename: 'src/notes/notes.controller.ts', code: "@Controller('notes') export class Notes {}", errors: [{ messageId: 'controller' }] },
    { filename: 'src/notes/notes.service.ts', code: '@Injectable() export class NotesRepo {}', errors: [{ messageId: 'service' }] },
  ],
});
