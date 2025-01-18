# Taskgit

**Taskgit** is a command-line tool that helps developers create organized, standardized, and easy-to-follow Git commits. It ensures consistency in commit messages by providing a structured format for your commit workflow.

# Table of Contents

- [🔧 Installation](#installation)
    - [🛠️ Local Installation](#installation-local)
    - [🌍 Global Installation](#installation-global)
- [Available Commands](#available-commands)
    - **[✔️ commit](#commit-command)**: Create a new commit with a standardized message.
    - **[⚙️ config-user](#config-user-command)**: Configure the user's name and email address.
    - **[📊 report](#report-command)**: Generate a report of the commits made.
    - **[🏷️ tag](#tag-command)**: Manage git tags.
    - **[➕ add-diff](#diff-command)**: Add to stage hunk of files, similar to git add -p.
    - **[📜 changelog](#changelog-command)**: Generates a changelog file based on a list of Git commits.

<a id="installation"></a>

# 🔧 Installation

To install this project as a client-independent dependency, you need to install the branch or commit you want to reference as the version.

<a id="installation-local"></a>

## 🛠️ Local Installation

To install **Taskgit** locally in your project, follow these steps:

1. **Clone the repository from the `cli` branch:**
   First, clone the Taskgit repository from the `cli` branch, which contains the most current version of the project:

    ```bash
    git clone --branch cli git@github.com:guiurm/taskgit.git
    ```

2. **Navigate to the project directory:**
   Then, go to the directory where the repository was cloned:

    ```bash
    cd taskgit
    ```

3. **Create the package locally:**
   Once inside the project directory, run the following command to create the compressed package that will be installed:

    ```bash
    npm pack
    ```

4. **Install the package locally in your project:**
   Now, in your project where you want to use **Taskgit**, install the compressed package you just created. Be sure to replace `<version>` with the version generated when you ran the previous command:

    ```bash
    npm install /path/to/taskgit/taskgit-<version>.tgz
    ```

    In this step, `/path/to/taskgit/` should be the path to the directory where you cloned the repository and generated the compressed package.

<a id="installation-global"></a>

## 🌍 Global Installation

To install **Taskgit** globally, follow these steps:

1. **Clone the repository from the `cli` branch:**

    ```bash
    git clone --branch cli git@github.com:guiurm/taskgit.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd taskgit
    ```

3. **Create the package locally:**

    ```bash
    npm pack
    ```

4. **Install the compressed package globally:**
    ```bash
    npm install -g taskgit-<version>.tgz
    ```

Replace `<version>` with the version generated when you created the local package.

# Available Commands

- **[`commit`](#commit-command)**: Create a new commit with a standardized message.
- **[`config-user`](#config-user-command)**: Configure the user's name and email address.
- **[`report`](#report-command)**: Generate a report of the commits made.
- **[`tag`](#tag-command)**: Manage git tags.
- **[`add-diff`](#diff-command)**: Add to stage hunk of files, similar to git add -p.
- **[`changelog`](#changelog-command)**: Generates a changelog file based on a list of Git commits.

<a id="commit-command"></a>

## ✔️ Commit Command

The `commit` command is used to create a new commit with a standardized message. It has the following options:

| Option             | Description                          | Type   | Required |
| ------------------ | ------------------------------------ | ------ | -------- |
| `-t` or `--type`   | The type of the commit               | string | ✅       |
| `-m` or `--title`  | The title of the commit              | string | ❌       |
| `-b` or `--body`   | The body of the commit               | string | ❌       |
| `-a` or `--ammend` | Whether to amend the previous commit | -      | ❌       |

Example usage:

```bash
taskgit commit -t feat -m "Add new functionality"
```

<a id="config-user-command"></a>

## ⚙️ Config-User Command

The `config-user` command is used to configure the user's name and email address. It has the following options:

| Option            | Description           | Type   | Required |
| ----------------- | --------------------- | ------ | -------- |
| `-n` or `--name`  | The name of the user  | string | ❌       |
| `-e` or `--email` | The email of the user | string | ❌       |

Example usage:

```bash
taskgit config-user -n "John Doe" -e "john.doe@example.com"
```

<a id="report-command"></a>

## 📊 Report Command

The `report` command is used to generate a report of the commits made. It has the following option:

| Option             | Description              | Values                            | Required |
| ------------------ | ------------------------ | --------------------------------- | -------- |
| `-t` or `--target` | The target of the report | `staged`, `unstaged`, `untracked` | ❌       |

Example usage:

_list all reports_

```bash
taskgit report
```

_list staged files_

```bash
taskgit report -t staged
```

_list unstaged files_

```bash
taskgit report -t unstaged
```

_list untracked files_

```bash
taskgit report -t untracked
```

<a id="tag-command"></a>

## 🏷️ Tag Command

The `tag` command can be used has the following options:

### Add a new tag

| Option              | Description                        | Values          | Required |
| ------------------- | ---------------------------------- | --------------- | -------- |
| `-a` or `--add`     | The name of the tag                | `<tag_name>`    | ✅       |
| `-m` or `--message` | The message of the tag             | `<tag_message>` | ❌       |
| `-r` or `--remote`  | The remote to update with tag info | `<remote>`      | ❌       |

Example usage:

```bash
taskgit tag -a v1.0.0 -m "Initial release" -r origin
```

### List tags

**All of these options are mutually exclusive**

| Option                   | Description                | Values   | Required |
| ------------------------ | -------------------------- | -------- | -------- |
| `-ll` or `--list-local`  | List local tags            | `<none>` | ❌       |
| `-lr` or `--list-remote` | List remote tags           | `<none>` | ❌       |
| `-l` or `--list`         | List local and remote tags | `<none>` | ❌       |

Example usage:

```bash
taskgit tag -l
```

```bash
taskgit tag -lr
```

```bash
taskgit tag -ll
```

### Delete tags

| Option             | Description                        | Values       | Required |
| ------------------ | ---------------------------------- | ------------ | -------- |
| `-d` or `--delete` | The name of the tag                | `<tag_name>` | ✅       |
| `-r` or `--remote` | The remote to update with tag info | `<remote>`   | ❌       |

Example usage:

```bash
taskgit tag -d v1.0.0 -r origin
```

<a id="diff-command"></a>

## ➕ Add-diff Command

The `add-diff` command is used to add a diff to a commit. It has the following options:

| Option           | Description                 | Required |
| ---------------- | --------------------------- | -------- |
| `-f` or `--file` | The name of the target file | ✅       |

Example usage:

```bash
taskgit add-diff -f path/to/file.txt
```

<a id="changelog-command"></a>

## 📜 Changelog Command

The `changelog` command generates a changelog file based on a list of Git commits.

### Options

| Option             | Description                                           | Required |
| ------------------ | ----------------------------------------------------- | -------- |
| `-f` or `--from`   | The commit from which the changelog will be generated | ❌       |
| `-t` or `--to`     | The commit to which the changelog will be generated   | ❌       |
| `-b` or `--branch` | The branch from which the changelog will be generated | ❌       |

### Arguments

| Option         | Description                                   | Required |
| -------------- | --------------------------------------------- | -------- |
| `<outputFile>` | The name of the output file for the changelog | ✅       |

### Usage example

```bash
taskgit changelog -f <commit_from> -t <commit_to> -b <branch> <outputFile>
```
