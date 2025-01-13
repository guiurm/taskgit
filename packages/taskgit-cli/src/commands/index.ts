import { diffPickCommand } from './addDiffCommand';
import { changelogCommand } from './changelogCommand';
import { commitCommand } from './commitCommand';
import { configUserCommand } from './configUserCommand';
import { reportCommand } from './reportCommand';
import { tagCommand } from './tagCommand';

const commands = [commitCommand, diffPickCommand, configUserCommand, reportCommand, tagCommand, changelogCommand];

export { commands };
