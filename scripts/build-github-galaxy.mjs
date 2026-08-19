import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const username = process.env.GITHUB_GALAXY_USERNAME || "CesarSGZ";
const repositoryRoot = resolve(process.cwd());
const outputFile = join(repositoryRoot, "control", "data", "github-galaxy.json");
const temporaryRoot = mkdtempSync(join(tmpdir(), "cesar-github-galaxy-"));

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

async function github(path) {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "CesarHomeLab-Galaxy-Builder",
    "x-github-api-version": "2026-03-10",
  };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

function parseHistory(cwd) {
  const output = git(cwd, [
    "log", "--all", "--reverse", "--date=iso-strict", "--find-renames",
    "--format=%x1e%H%x1f%aN%x1f%aI%x1f%s", "--name-status",
  ]);
  return output.split("\x1e").slice(1).map((record) => {
    const lines = record.replace(/^\r?\n/, "").split(/\r?\n/);
    const [sha, author, date, message] = lines.shift().split("\x1f");
    const changes = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const [rawStatus, firstPath, secondPath] = line.split("\t");
      if (!rawStatus || !firstPath) continue;
      const status = rawStatus[0];
      changes.push({
        status,
        path: status === "R" || status === "C" ? secondPath : firstPath,
        oldPath: status === "R" || status === "C" ? firstPath : null,
      });
    }
    return { sha, author, date, message, changes };
  }).filter((commit) => commit.sha && commit.changes.length).slice(-600);
}

function readBranches(cwd) {
  const rows = git(cwd, ["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin"])
    .split(/\r?\n/)
    .map((value) => value.trim().replace(/^origin\//, ""))
    .filter((value) => value && value !== "HEAD" && value !== "origin");
  return [...new Set(rows)].sort();
}

function readFiles(cwd) {
  return git(cwd, ["ls-tree", "-r", "--name-only", "HEAD"])
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function main() {
  const [profile, repositories] = await Promise.all([
    github(`/users/${encodeURIComponent(username)}`),
    github(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`),
  ]);
  const currentRemote = (() => {
    try { return git(repositoryRoot, ["remote", "get-url", "origin"]).toLowerCase(); }
    catch { return ""; }
  })();
  const repos = [];

  for (const repository of repositories) {
    let checkout = repositoryRoot;
    const isCurrent = currentRemote.includes(`${repository.full_name.toLowerCase()}.git`)
      || currentRemote.endsWith(repository.full_name.toLowerCase());
    try {
      if (!isCurrent) {
        checkout = join(temporaryRoot, String(repository.id));
        git(temporaryRoot, ["clone", "--quiet", "--filter=blob:none", "--no-checkout", repository.clone_url, checkout]);
      }
      repos.push({
        id: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description || "No description yet.",
        url: repository.html_url,
        language: repository.language || "Other",
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        sizeKb: repository.size,
        defaultBranch: repository.default_branch,
        pushedAt: repository.pushed_at,
        archived: Boolean(repository.archived),
        branches: readBranches(checkout),
        files: readFiles(checkout),
        commits: parseHistory(checkout),
      });
    } catch (error) {
      console.warn(`Skipping ${repository.full_name}: ${error.message}`);
    }
  }

  mkdirSync(join(repositoryRoot, "control", "data"), { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    profile: {
      login: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      url: profile.html_url,
      publicRepos: profile.public_repos,
    },
    repos,
  })}\n`);
  console.log(`Generated ${outputFile} with ${repos.length} repositories.`);
}

try {
  await main();
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
