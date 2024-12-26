import { diffPickCommand } from './addDiffCommand';
import { changelogCommand } from './changelogCommand';
import { commitCommand } from './commitCommand';
import { configUserCommand } from './configUserCommand';
import { reportCommand } from './reportCommand';
import { tagAddCommand } from './tagAddCommand';
import { tagListCommand } from './tagListCommand';
import { tagRemoveCommand } from './tagRemoveLocal';

const commands = [
    commitCommand,
    diffPickCommand,
    configUserCommand,
    reportCommand,
    tagListCommand,
    tagRemoveCommand,
    tagAddCommand,
    changelogCommand
];

export { commands };
