import { diffPickCommand } from './addDiffCommand';
import { changelogCommand } from './changelogCommand';
import { commitCommand } from './commitCommand';
import { configUserCommand } from './configUserCommand';
import { reportCommand } from './reportCommand';
import { tagCommand } from './tagCommand';
import { tagListCommand } from './tagListCommand';

const commands = [
    commitCommand,
    diffPickCommand,
    configUserCommand,
    reportCommand,
    tagListCommand,
    tagCommand,
    changelogCommand
];

export { commands };
