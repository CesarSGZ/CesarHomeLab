import {writeFileSync} from 'node:fs';
import {cloudDatabase} from './office-cloud-db.mjs';
import {auditLiveOffice} from '../trading-worker/live-audit.js';
import {installPublicDataBridge} from './office-cloud-fetch.mjs';
installPublicDataBridge(process.env.OFFICE_DEV_TOKEN);
const report=await auditLiveOffice({CONTROL_DB:cloudDatabase()});report.providerProbe.environment='GitHub Actions · estado en Cloudflare';writeFileSync('/tmp/office-live-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({at:report.at,scheduler:report.scheduler,provider:report.providerProbe,productionMarket:report.productionMarket,paperBook:report.paperBook,meeting:report.meeting}));
