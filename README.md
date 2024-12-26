**Taskgit** is a command-line tool that helps developers create organized, standardized, and easy-to-follow Git commits. It ensures consistency in commit messages by providing a structured format for your commit workflow.

# Available Commands

- **`commit`**: Create a new commit with a standardized message.
- **`config-user`**: Configure the user's name and email address.
- **`report`**: Generate a report of the commits made.
- **`tag-add`**: Add a new tag to a commit.
- **`tag-list`**: List all available tags.
- **`tag-remove`**: Remove an existing tag.
- **`add-diff`**: Add to stage hunk of files, similar to git add -p.
- **`changelog`**: Generates a changelog file based on a list of Git commits.

## Commit Command

The `commit` command is used to create a new commit with a standardized message. It has the following options:

- **`-t`** or **`--type`**: The type of the commit. This option is required.
- **`-m`** or **`--title`**: The title of the commit. This option is optional.
- **`-b`** or **`--body`**: The body of the commit. This option is optional.
- **`-a`** or **`--ammend`**: Whether to amend the previous commit. This option is optional.

Example usage:

```bash
$ taskgit commit -t feat -m "Add new functionality"
```

## Config-User Command

The `config-user` command is used to configure the user's name and email address. It has the following options:

- **`-n`** or **`--name`**: The name of the user. This option is optional.
- **`-e`** or **`--email`**: The email of the user. This option is optional.

Example usage:

```bash
$ taskgit config-user -n "John Doe" -e "john.doe@example.com"
```

## Report Command

The `report` command is used to generate a report of the commits made. It has the following option:

- **`-t`** or **`--target`**: The target of the report. This option is optional: `staged, unstaged or untracked`.

Example usage:

_list all reports_

```bash
$ taskgit report
```

_list staged files_

```bash
$ taskgit report -t staged
```

_list unstaged files_

```bash
$ taskgit report -t unstaged
```

_list untracked files_

```bash
$ taskgit report -t untracked
```

## Tag-Add Command

The `tag-add` command is used to add a new tag to a commit. It has the following options:

- **`-t`** or **`--tag`**: The name of the tag. This option is required.
- **`-m`** or **`--message`**: The message of the tag. This option is optional.
  Example usage:

```bash
$ taskgit tag-add -t v1.0.0 -m "Initial release"
```

## Tag-List Command

The `tag-list` command is used to list all available tags. It has no options.

**All of this options are mutually exclusive**

- **`-ll`** or **`--list-local`**: List local tags. This option is optional.
- **`-lr`** or **`--list-remote`**: List remote tags. This option is optional.
- **`-l`** or **`--list`**: List local and remote tags. This option is optional.
  Example usage:

```bash
$ taskgit tag-list
```

## Tag-Remove Command

The `tag-remove` command is used to remove an existing tag. It has the following options:

- **`-t <tag_name>`** or **`--tag <tag_name>`**: The name of the tag. This option is required.
- **`-rem <remote>`** or **`--remote <remote>`**: Whether to remove the tag from the remote repository. This option is optional. By deffault the value of this option is _`origin`_

Example usage:

```bash
$ taskgit tag-remove -t v1.0.0 -rem
```

## Add-diff Command

The `add-diff` command is used to add a diff to a commit. It has the following options:

- **`-f`** or **`--file`**: The name of the target file. This option is required.

Example usage:

```bash
$ taskgit add-diff -f path/to/file.txt
```

# changelog command

The `changelog` command generates a changelog file based on a list of Git commits.

## Options

- **`-f`** or **`--from`**: The commit from which the changelog will be generated. This option is optional.
- **`-t`** or **`--to`**: The commit to which the changelog will be generated. This option is optional.
- **`-b`** or **`--branch`**: The branch from which the changelog will be generated. This option is optional.
- **`<outputFile>`**: The name of the output file for the changelog. This parameter is mandatory.

## Usage example

```bash
$ taskgit changelog -f <commit_from> -t <commit_to> -b <branch> <outputFile>
```
