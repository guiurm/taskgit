#!/usr/bin/env node

import { AppError, ErrorHandler, IS_DEV, IS_TEST } from '@guiurm/taskgit-core';
import { Termify } from '@guiurm/termify';
import { commands } from './commands';

//exeCommand("git config user.name");
const run = async () => {
    ErrorHandler.subscribe(error => {
        console.error(`\n[${error.VERSION_NAME}]: ${error.message}`);
        if (error instanceof AppError && (IS_DEV || IS_TEST))
            console.log(`Error ocurred during script execution at:\n${error.errorTrack}\n`);

        process.exit(1);
    });

    await new Termify(commands).start();
};

run();
