import { exeCommand } from '@services/exe-service';

class ConfigService {
    /**
     * Get the user configuration from Git.
     *
     * @returns A promise that resolves with an object containing the user name and email.
     * @throws {FilesReportServiceError} If the command fails.
     */
    public static async getUser() {
        const name = await exeCommand('git config user.name');
        const email = await exeCommand('git config user.email');

        return { name, email, toString: () => `${name} <${email}>` };
    }

    /**
     * Set the user configuration in Git.
     *
     * @param name The user's name to set in the Git configuration.
     * @param email The user's email to set in the Git configuration.
     * @returns A promise that resolves when the user configuration is successfully set.
     * @throws {FilesReportServiceError} If the command fails.
     */
    public static async setUser(name: string, email: string) {
        await exeCommand(`git config user.name "${name}" && git config user.email "${email}"`);
    }
}

export { ConfigService };
