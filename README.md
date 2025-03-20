# iExec Protocol documentation

Welcome to the iExec Protocol documentation repository.

This guide will help you understand how to contribute to the documentation,
ensuring it remains accurate, comprehensive, and user-friendly.

This is the source repository of the
[iExec protocol documentation](https://protocol.docs.iex.ec)

## Documentation Structure

The iExec Protocol documentation is built using VitePress and follows a
structured approach to organize technical information. Before making changes,
familiarize yourself with:

- The directory structure
- Markdown formatting conventions
- The sidebar navigation system

# Contribution Process

Contributing to the documentation follows these steps:

- Fork the repository to your GitHub account
- Clone your fork to your local machine
- Set up the development environment using Node.js
- Make your changes following our documentation standards
- Test your changes locally to ensure they render correctly
- Submit a pull request for review

# Fork the repository

Fork the repo and be sure to be on `main` branch

[![fork-button](./public/fork-button.png)](https://github.com/iExecBlockchainComputing/documentation/fork)

# Local Development

To run the documentation site locally:

1. Ensure you have Node.js 20 installed

2. Install dependencies with npm install

```
npm install
```

3. Run the Tailwind watcher with npm run tailwind:watch (keep this running)

```
npm run tailwind:watch  (keep it running)
```

4. Start the development server with npm run dev

```
npm run dev
```

5. View the site at the URL provided in your terminal

Run format using Prettier if necessary and Push your changes to your forked
branch.

```
npm run format
```

# Modifying the Sidebar

To modify the sidebar, you need to edit the `.vitepress/sidebar.ts` file. This
file contains the configuration for the sidebar navigation. If you modify a
filename, add a new file, or move a file, make sure to update `sidebar.ts`
accordingly to reflect these changes.

# Pull Requests

Apply your changes on your forked branch, stage them and commit them with a
descriptive commit message.

Open a pull request from your forked branch to our `main` branch.

> _**Tips:**_ You can open a draft pull request and set it to "Ready for review"
> once you are happy with the preview. Opened pull requests will be reviewed by
> the team and merged once approved.
