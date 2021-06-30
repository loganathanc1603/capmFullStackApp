# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch` 
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.

Git link: https://github.com/SAP-samples/cloud-cap-risk-management/tree/cap/launchpage

Course link: https://developers.sap.com/mission.btp-application-cap-e2e.html

Build Command: mbt build -t ./
Push command: cf deploy cpapp_1.0.0.mtar

Important commands CF build & deploy:
mbt build
cf deploy mta_archives/bookshop_1.0.0.mtar
