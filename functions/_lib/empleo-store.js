// Empleo storage, shared by the signed-in page (/control/api/empleo/status) and the door for Claude and the
// offer robot (/api/empleo). One row of personal_datasets; the key starts with empleo_.
import { applyOps, emptyDoc } from '../../control/empleo-model.js';
import { makeStore } from './dataset-store.js';

export const DATASET = 'empleo', AGENT = 'empleo-agent';

export const { readDoc, writeOps, newAgentKey, agentKeyInfo, revokeAgentKey, agentAuthorised } =
  makeStore({ dataset: DATASET, agent: AGENT, prefix: 'empleo_', applyOps, emptyDoc });
