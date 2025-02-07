import { wf } from '@services/file-management-service/fileService';
import { AppError, ErrorHandler } from '../error-handler';

class MarkdownService {
    private _content: string;

    constructor() {
        this._content = ''; // Inicializamos el contenido vacío
    }

    /**
     * Adds a title to the markdown content.
     * @param {string} text The text of the title.
     * @param {number} [level=1] The level of the title, from 1 to 6.
     * @returns {this} The markdown service to chain methods.
     */
    public addTitle(text: string, level: number = 1): this {
        if (level < 1 || level > 6) ErrorHandler.throw(new AppError('Level must be between 1 and 6.'));
        const title = '#'.repeat(level) + ` ${text}\n`;
        this._content += title;
        return this;
    }

    /**
     * Adds a paragraph to the markdown content.
     * @param {string} text The text of the paragraph.
     * @returns {this} The markdown service to chain methods.
     */
    public addParagraph(text: string): this {
        this._content += `${text}\n\n`;
        return this;
    }

    /**
     * Adds a specified number of end lines to the markdown content.
     * @param {number} [ammount=1] The number of end lines to add.
     * @returns {this} The markdown service to chain methods.
     */
    public addEndLine(ammount: number = 1): this {
        this._content += '\n'.repeat(ammount);
        return this;
    }

    /**
     * Add an unordered list to the markdown content.
     * @param {string[]} items The items to include in the unordered list.
     * @returns {this} The markdown service to chain methods.
     */
    public addUnorderedList(items: string[]): this {
        items.forEach(item => {
            this._content += `- ${item}\n`;
        });
        this._content += '\n';
        return this;
    }

    /**
     * Add an ordered list to the markdown content.
     * @param {string[]} items The items to include in the ordered list.
     * @returns {this} The markdown service to chain methods.
     */
    public addOrderedList(items: string[]): this {
        items.forEach((item, index) => {
            this._content += `${index + 1}. ${item}\n`;
        });
        this._content += '\n';
        return this;
    }

    /**
     * Add a link to the markdown content.
     * @param {string} text The text of the link.
     * @param {string} url The URL of the link.
     * @returns {this} The markdown service to chain methods.
     */
    public addLink(text: string, url: string): this {
        this._content += `[${text}](${url})\n`;
        return this;
    }

    /**
     * Add a code block to the markdown content.
     * @param {string} code The code to add.
     * @param {string} [language='typescript'] The language of the code block.
     * @returns {this} The markdown service to chain methods.
     */
    public addCodeBlock(code: string, language: string = 'typescript'): this {
        this._content += `\`\`\`${language}\n${code}\n\`\`\`\n`;
        return this;
    }

    /**
     * Getter for the markdown content.
     * @returns {string} The markdown content.
     */
    public get contentMarkdown(): string {
        return this._content;
    }

    /**
     * Resets the markdown content to an empty string.
     * @returns {this} The markdown service to chain methods.
     */
    public clear(): this {
        this._content = '';
        return this;
    }

    /**
     * Outputs the current markdown content to a file.
     * @param {string} path - The path to the file where the markdown content should be written.
     * @returns {this} The markdown service to chain methods.
     * @throws {FileServiceError} If an error occurs while writing to the file.
     */
    public outputToFile(path: string): this {
        wf(path, this._content);
        return this;
    }

    /**
     * Adds a string of plain text to the markdown content. (NO ENDLINE)
     * @param {string} text The text to add.
     * @returns {this} The markdown service to chain methods.
     */
    public addText(text: string): this {
        this._content += text;
        return this;
    }
}

export { MarkdownService };
