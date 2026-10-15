import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import { resolve } from 'node:path';
import tseslint from 'typescript-eslint';
import classSuffix from '../rules/class-suffix.js';
import filePerRole from '../rules/file-per-role.js';
import noSqlInController from '../rules/no-sql-in-controller.js';
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

tester.run('no-sql-in-controller', noSqlInController, {
  valid: [
    { filename: 'src/notes/notes.service.ts', code: "db.query('SELECT id FROM notes WHERE id = $1', [id])", name: '서비스의 SQL 은 된다' },
    { filename: 'src/notes/notes.controller.ts', code: "throw new BadRequestException('Update failed')", name: '키워드 하나는 SQL 이 아니다' },
    { filename: 'src/notes/notes.controller.ts', code: "throw new NotFoundException('삭제할 메모가 없다 — delete 는 한 번만')" },
    { filename: 'src/notes/notes.controller.ts', code: "class A { @ApiOperation({ summary: 'select 할 메모를 고른다' }) x() {} }", name: '문장 중간의 단어는 SQL 이 아니다' },
  ],
  invalid: [
    { filename: 'src/p/public.controller.ts', code: "db.query('SELECT id, name FROM projects WHERE public_key = $1', [k])", errors: [{ messageId: 'sql' }] },
    { filename: 'src/p/p.controller.ts', code: 'db.query(`\n  select *\n  from pages where id = ${id}`)', errors: [{ messageId: 'sql' }], name: '템플릿 문자열·소문자·줄바꿈' },
    { filename: 'src/p/p.controller.ts', code: "q('INSERT INTO notes (title) VALUES ($1)')", errors: [{ messageId: 'sql' }] },
    { filename: 'src/p/p.controller.ts', code: "q('UPDATE notes SET title = $1')", errors: [{ messageId: 'sql' }] },
    { filename: 'src/p/p.controller.ts', code: "q('DELETE FROM notes WHERE id = $1')", errors: [{ messageId: 'sql' }] },
    { filename: 'src/p/p.controller.ts', code: "q('WITH t AS (SELECT 1) SELECT * FROM t')", errors: [{ messageId: 'sql' }] },
  ],
});
