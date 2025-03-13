# iExec Protocol documentation

This is the source repository of the
[iExec protocol documentation](https://protocol.docs.iex.ec)

## Prerequisites

- Node 20

## Run app

```
npm install
npm run tailwind:watch  (keep it running)
npm run dev
```

## Contributing

To keep the contribution process smooth, please read this small guide.

### Fork

Fork the repo and be sure to be on `main` branch

[![fork-button](./public/fork-button.png)](https://github.com/iExecBlockchainComputing/documentation/fork)

### Contribute

Apply your changes on your forked branch, stage them and commit them with a
descriptive commit message.

Push your changes to your forked branch.

### Modifying the Sidebar

To modify the sidebar, you need to edit the .vitepress/sidebar.ts file. This
file contains the configuration for the sidebar navigation. If you modify a
filename, add a new file, or move a file, make sure to update sidebar.ts
accordingly to reflect these changes.

### PR time

Open a pull request from your forked branch to our `main` branch.

> _**Tips:**_ You can open a draft pull request and set it to "Ready for review"
> once you are happy with the preview. Opened pull requests will be reviewed by
> the team and merged once approved.
