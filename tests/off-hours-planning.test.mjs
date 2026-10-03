import test from 'node:test';
import assert from 'node:assert/strict';
import {planningReference,referenceSource,refreshMarket} from '../trading-worker/market-data.js';
import {freshQuote} from '../trading-worker/core.js';
const saturday=Date.parse('2026-10-03T12:00:00Z');
const q={price:8,time:Date.parse('2026-10-02T19:50:00Z'),fetchedAt:saturday,referenceOnly:true,currency:'USD',source:referenceSource};
test('Friday reference supports weekend planning but cannot authorize an entry',()=>{assert.equal(planningReference(q,saturday),true);assert.equal(freshQuote(q,saturday),false);assert.equal(planningReference({...q,time:saturday-8*864e5},saturday),false);assert.equal(planningReference({...q,source:'inventada'},saturday),false);assert.equal(planningReference({...q,time:saturday+6000},saturday),false);});
test('closed market keeps useful cached references without polling the provider',async()=>{let calls=0;const state={mode:'real',real:{events:[{confirmed:true,status:'nuevo',symbol:'ABC',date:'2026-10-10'}],book:{positions:[]},assets:[],quotes:{ABC:q},marketProviderAt:saturday-3600e3}};await refreshMarket(state,{now:saturday,fetcher:async()=>{calls++;throw Error('network should not run');}});assert.equal(calls,0);assert.match(state.real.marketStatus,/Mercado cerrado/);});
