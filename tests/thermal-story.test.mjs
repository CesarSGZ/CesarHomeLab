import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../control/data/terra-thermal-summary.json', import.meta.url), 'utf8'));
const story = data.story;

test('the Thermal Lab dataset carries the story the presentation is drawn from', () => {
  assert.ok(story, 'story section exists');
  for (const key of ['question_es', 'one_liner_es', 'phases', 'timeline', 'next_steps', 'cfd_gate', 'conclusions', 'uses', 'research']) {
    assert.ok(story[key], `story.${key} exists`);
  }
});

test('there is always a next step', () => {
  const pending = story.next_steps.filter(step => step.status !== 'done');
  assert.ok(pending.length > 0, 'at least one step is still to do');
  assert.equal(story.next_steps.filter(step => step.status === 'next').length, 1, 'exactly one step is marked next');
  assert.equal(story.phases.filter(phase => phase.status === 'next').length, 1, 'exactly one phase is current');
  for (const step of story.next_steps) {
    assert.ok(step.title.es && step.title.en && step.detail.es && step.detail.en, 'every step is written in Spanish and English');
  }
});

test('the timeline is in order and the update date follows the last entry', () => {
  const dates = story.timeline.map(item => item.date);
  assert.deepEqual(dates, [...dates].sort(), 'timeline is chronological');
  assert.ok(story.updated >= dates.at(-1), 'story.updated is not older than the last timeline entry');
  assert.ok(data.generated_at.slice(0, 10) >= story.updated, 'generated_at was bumped with the story');
});

test('every idea and model has a plain-language name for the presentation', () => {
  for (const row of data.configuration_screening) assert.ok(row.plain_es?.title, `${row.configuration_id} has plain_es`);
  for (const model of data.model_lineage) assert.ok(model.plain_es?.verdict, `${model.id} has plain_es`);
});

test('the page loads the presentation before the Thermal Lab renders', async () => {
  const html = await readFile(new URL('../control/index.html', import.meta.url), 'utf8');
  assert.match(html, /<dialog class="tl-deck" id="tl-deck"/);
  assert.match(html, /data-open-deck/);
  assert.ok(html.indexOf('thermal-deck.js') < html.indexOf('control.js?'), 'thermal-deck.js loads before control.js');
  const control = await readFile(new URL('../control/control.js', import.meta.url), 'utf8');
  assert.match(control, /window\.ThermalDeck\?\.render\(data\)/);
});
