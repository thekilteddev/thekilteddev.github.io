---
layout: post.njk
title: Blocked, Not Rejected
kicker: Field notes / tooling
standfirst: >-
  The most capable-looking command in a 57-item tool catalogue turned out to be five function calls
  to a server this setup doesn't run. No trial was run: narrating what a missing server would do
  isn't a test. The verdict needed a name of its own, and blocked fit.
description: >-
  A tool catalogue's single most capable-looking command turned out to be calls to a server that was
  never installed. Why the verdict became blocked instead of rejected, and what that distinction is
  actually for.
date: 2026-10-10
bylineTags: ["tool evaluation", "hidden dependencies"]
permalink: /blocked-not-rejected/
---

<section class="lead">

<span class="entity">SuperClaude</span> is a configuration layer for Claude Code, installed as an
add-on rather than built in: slash commands, agents and behavioural modes, fifty-seven items in
the catalogue in total. One of them read as the single most capable thing in it.

<span class="entity">pm-agent</span>, invoked as `/sc:pm`, read on paper like a full
session-management layer. Cross-session memory that survives between conversations. Checkpointing
every thirty minutes. Self-evaluation, so the agent could ask itself whether it was actually done
before reporting done. The kind of feature list that makes a reader comparing AI coding tools stop
and read it twice.

</section>

<section>

## <span class="h2-num">0 of 8</span>The check

The catalogue's own summary of `/sc:pm` never says how any of that actually works. Reading the
full source (`agents/pm-agent.md` and `commands/pm.md` in the SuperClaude repository) does.

Every one of those mechanisms turned out to be a literal call to a function on a Serena server.
Serena is an MCP (Model Context Protocol) server, a separate program that Claude Code connects to
for extra tools. The calls are
`list_memories()`, `read_memory()`, `write_memory()`, `think_about_task_adherence()`,
`think_about_whether_you_are_done()`. Cross-session memory was a named function call to a server.
So was self-evaluation: another named call to the same server. None of those functions exist
without a Serena MCP server actually connected, and at the time of the review this setup's
`.mcp.json` defined no servers at all. None, checked directly in the file rather than assumed.

The dependency did not stop there. For full behaviour, `/sc:pm` also wanted seven more MCP
servers (eight, all told, all absent) loaded dynamically through a third-party Docker gateway,
`airis-mcp-gateway`. Reading more of the command's own source only lengthened the list of things
that would need to
exist first, never shortened it.

To run the same check on any tool, search its command files for calls to functions that need a
connected server, then compare that list with your own MCP configuration.

<p class="section-source">↳ <a href="https://github.com/SuperClaude-Org/SuperClaude_Framework">github.com/SuperClaude-Org/SuperClaude_Framework</a></p>

</section>

<section>

## <span class="h2-num">twice, not once</span>A repeat

The shape had shown up in the framework before. An earlier command, `/reflect`,
had already been excluded from an earlier pass for the identical reason. Its own file states
plainly, in its own "Will Not" section:

<blockquote><p>Operate without proper Serena MCP integration and reflection tool access.</p></blockquote>

Same disqualifying issue, same missing server, a different command. Once is a fact about one
command. Twice is a fact about the framework's own design pattern: describe a capability in the
documentation, implement it as a call to infrastructure the reader is never told they need.

</section>

<section>

## <span class="h2-num">one dependency, one precedent</span>A second objection

Set the missing server aside, and there was still a second, unrelated problem. The command's own
file declared itself the default operating foundation:

<blockquote><p>The DEFAULT operating foundation that runs automatically at every session start...
the default entry point for all interactions.</p></blockquote>

Auto-delegating every request to sub-agents before a human ever saw it. That was a takeover of a
workflow already in place, duplicating this setup's own working four-file lifecycle (`NOTES.md`,
`MEMORY.md`, `CLAUDE.md`, `DECISIONS.md`).

A different project in the same workspace had already declined the exact same shape for the
framework's Deep Research mode: an ungated feature that wanted to become the default way every
session behaved, rather than a tool invoked on request. This setup read that rule, then reached the
same objection on pm-agent and checked it against that record. The missing server was the
independent finding; the second objection leaned on that earlier record.

</section>

<section>

## <span class="h2-num">blocked, not rejected</span>The verdict

No trial was run. On paper the command looked capable, but a trial without the missing server
would only narrate what `write_memory()` would do, with nothing real underneath the narration.

<p class="pull">A trial without the server would be a plausible performance of a test.</p>

This setup keeps a standing rule for exactly that failure mode: trust the artifact over the
summary. Reading `pm-agent`'s actual source instead of its one-line catalogue description is what caught
the gap before a fake trial could run.

<p class="pull">So the verdict on record was not rejected. It was blocked.</p>

A blocked verdict names the specific missing thing and stays open to being wrong about it. If a
Serena MCP server is ever installed here for an unrelated reason, this is worth a second look.
The session-takeover design would still need weighing on its own merits. A smaller, scoped-down
version of the trial was floated too and turned down; that was the project owner's call, and no
second missing dependency lay behind it. A rejected verdict would have closed that door for good.
This one stayed open on purpose.

</section>
