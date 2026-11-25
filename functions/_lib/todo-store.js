// Tareas storage, shared by the signed-in page (/control/api/todo/status) and Claude's door (/api/tareas).
// Every list lives in one row of personal_datasets; writes are changes (ops) applied on top of the newest copy.
import { applyOps, emptyDoc } from '../../control/todo-model.js';
import { makeStore } from './dataset-store.js';

export const DATASET = 'todo', AGENT = 'todo-agent';

export const { readDoc, writeOps, newAgentKey, agentKeyInfo, revokeAgentKey, agentAuthorised } =
  makeStore({ dataset: DATASET, agent: AGENT, prefix: 'tareas_', applyOps, emptyDoc });
