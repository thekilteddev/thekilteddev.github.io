---
layout: post.njk
title: Still carrying the diagnosis
kicker: Field notes / local-model tooling
standfirst: >-
  A coding harness that had already scored 8 out of 8 on this machine went quiet for an hour. It
  exited 0 and wrote no file. The replacement shipped the same session. The explanation for why it
  failed lasted four days, and the correction that replaced it does not hold up either.
description: >-
  Field notes from a local-model pipeline. A coding agent benchmarked at 8 out of 8 started exiting 0
  without writing a file, and the driver built to replace it still carried the wrong diagnosis long
  after that diagnosis had been withdrawn.
date: 2026-09-26
bylineTags: ["local models", "silent failure"]
permalink: /carried-the-diagnosis/
---

<section class="lead">

The plan was to have a local model write six Python modules of a real application, one at a time,
each one gated on a test suite it had to make pass. The harness for that job was already chosen,
already benchmarked, and already recorded as working.

It produced nothing. Not bad code, no code. Zero files, for about an hour.

What happened next is worth reading less for the fix, which took a session, than for what happened to
the explanation afterward. The root cause was written down and spread into five documents, then
disproved four days later by a controlled retest run from a different project. And the correction
that replaced it, checked now against a benchmark run two weeks earlier, does not hold up against
that evidence either.

</section>

<section>

## <span class="h2-num">8 out of 8, 2.1 minutes</span>The benchmark behind it

The tool was <span class="entity">little-coder</span>, a small command-line coding agent tuned for
small models, a thin wrapper over the `pi` agent framework, installed from npm, pointed at a local
model server.

It hadn't been picked casually. On 4 July it ran a build-a-word-search-game benchmark on this machine
and scored 8 out of 8, with a build time of 2.1 minutes, including a follow-up fix that didn't
regress anything already working. Three files written to disk by the model's own write tool.
Criterion one of that benchmark is literally "3 files saved to disk," and it passed.

That run used `little-coder` v1.9.11 against a 30-billion-parameter mixture-of-experts coding model,
locally aliased <span class="entity">qwen3-coder-30b</span>. That pairing matters later.

The session built a launcher script around the winning recipe so no future session would have to
rediscover the setup, including a prompt rule found the hard way: the word "tool" can't appear
anywhere in the prompt, because even "command-line tool" trips a formatting failure in the model's
output. That's the level of tuning already banked before any of this started.

</section>

<section>

## <span class="h2-num">exit 0, zero files</span>Then nothing, silently

The next day, given the six modules to delegate, the harness failed completely.

The shape of the failure is the part worth sitting with. The command exited with status 0. It printed
the model's reply. It wrote no file. The reply was raw `<function=write>` XML, the model describing a
write in text form instead of the harness receiving a structured call it could actually execute.
Nothing parsed it, and nothing complained.

<p class="pull">Exit 0 with no output written is the worst failure mode a delegated task can have,
because every cheap way of checking says it worked.</p>

A caller reading the exit code sees success. A caller reading stdout sees a confident, well-formed
response. Only a caller that goes and looks at the filesystem sees the truth.

<figure class="fig">
  <div class="trials">
    <div class="trial-h"></div>
    <div class="trial-h">said it worked</div>
    <div class="trial-h">read the filesystem</div>
    <div class="trial-r">exit code: 0</div>
    <div class="trial yes">yes</div>
    <div class="trial no">no</div>
    <div class="trial-r">the reply: well-formed</div>
    <div class="trial yes">yes</div>
    <div class="trial no">no</div>
    <div class="trial-r">the file listing: zero files</div>
    <div class="trial no">no</div>
    <div class="trial yes">yes</div>
  </div>
  <figcaption class="fig-cap">Three ways of checking the same run. The two that reported success are the two that never went and looked; the one that looked is the only one that disagreed. Every solid mark in the first column is a false positive, which is what makes this failure mode expensive rather than merely annoying.</figcaption>
</figure>

The first attempt to get modules out of it was a cheap orchestrator agent, given room to fix the
harness itself. It ran for roughly an hour and about fifty tool calls, delivered zero modules, and
along the way took an action nobody had sanctioned: a global `npm install -g` that upgraded
`little-coder` from 1.9.11 to 1.9.13, mutating machine-wide tooling mid-run. That upgrade is the one
variable that changed between the benchmark that worked and the delegation that didn't.

The failure was then reproduced directly, by hand, rather than trusted from the agent's own report.
That's the only reason any of what follows is checkable at all.

</section>

<section>

## <span class="h2-num">34 commits, 52 tests</span>Depending on less

Rather than downgrade or re-pin a command-line tool that had already proved it could change
underneath a running project, the session wrote a replacement in the same sitting:
`delegate-via-rest.py`.

Its design is the whole lesson. The model still writes all the code. What the driver removes is the
model's need to call a tool at all. It sends the specification and the test file to the local
server's chat endpoint, takes the reply, pulls out the largest fenced code block, writes that block
to disk itself, runs pytest, and feeds any failure text back for another round. It talks only to
`127.0.0.1`.

That takes the entire tool-calling scaffold, the layer that had just failed, out of the critical
path. Writing a file is something the harness can do reliably. Asking a model to emit a structured
call that a third-party parser has to recognise depends on two things nobody in this pipeline
controls. The driver keeps the model doing the one part only it can do, and does the mechanical part
itself.

<figure class="fig">
  <svg class="path-fig" viewBox="0 0 660 220" role="img" aria-label="Two paths from a model to a file on disk. The harness path needs the model to emit a structured call and a parser to recognise it; that step broke, and the run exited 0 having written nothing. The driver path asks only for reply text and writes the file itself, then runs pytest and feeds any failure back for another round.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="12" letter-spacing="0.05em" fill="var(--ink-dim)">WHAT THE HARNESS PATH NEEDED TO WORK</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="56" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the model</text>
    <line x1="79" y1="51" x2="111" y2="51" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="119" y="56" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a structured call</text>
    <line x1="261" y1="51" x2="293" y2="51" stroke="var(--loch)" stroke-width="1.5"></line>
    <text x="301" y="56" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a parser recognises it</text>
    <line x1="483" y1="51" x2="495" y2="51" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 3"></line>
    <line x1="497" y1="43" x2="509" y2="59" stroke="var(--bad)" stroke-width="2"></line>
    <line x1="509" y1="43" x2="497" y2="59" stroke="var(--bad)" stroke-width="2"></line>
    <line x1="511" y1="51" x2="523" y2="51" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 3"></line>
    <text x="531" y="56" font-family="var(--font-mono)" font-size="13" fill="var(--ink-dim)">a file</text>
    <text x="0" y="82" font-family="var(--font-mono)" font-size="11.5" fill="var(--bad)">nothing parsed it, and nothing complained: exit 0, zero files</text>
    <text x="0" y="128" font-family="var(--font-mono)" font-size="12" letter-spacing="0.05em" fill="var(--ink-dim)">WHAT THE DRIVER ASKS FOR INSTEAD</text>
    <line x1="0" y1="138" x2="648" y2="138" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="172" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the model</text>
    <line x1="79" y1="167" x2="111" y2="167" stroke="var(--moss)" stroke-width="1.5"></line>
    <text x="119" y="172" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">reply text</text>
    <line x1="206" y1="167" x2="238" y2="167" stroke="var(--moss)" stroke-width="1.5"></line>
    <text x="246" y="172" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the driver writes it</text>
    <line x1="412" y1="167" x2="444" y2="167" stroke="var(--moss)" stroke-width="1.5"></line>
    <text x="452" y="172" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">a file</text>
    <text x="0" y="198" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">the largest fenced block, written to disk, then pytest;</text>
    <text x="0" y="214" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">any failure text goes back for another round</text>
  </svg>
  <figcaption class="fig-cap">The step the driver deletes is the one nobody in this pipeline controls. Writing a file is something a harness can always do; being understood by a third-party parser is not.</figcaption>
</figure>

Rounds ran 8 to 30 seconds on this hardware. Across the six modules, three passed their tests on the
first attempt. The other three converged within a few rounds each, usually by sharpening the
specification rather than coaxing the model. The finished application ran to 34 commits and 52
passing tests.

Two features were added later, and each one encodes a failure that had already happened. A
`--selfcheck` preflight runs a trivial task end to end through the real endpoint before any real
dispatch, because a "verified working" harness had already broken silently between sessions. A
`--probe` flag runs a held-out adversarial test file after the acceptance tests go green, and its
output is deliberately never shown to the model, because feeding it back would let the model overfit
the probe the same way weak acceptance tests had already overfit twice. The driver also carries four
distinct exit codes instead of a plain pass or fail, including one specifically for tests green but
the held-out probe failed. After a silent exit-0 incident, none of that reads as over-engineering.

| Exit code | Meaning |
|---|---|
| 0 | Tests green |
| 1 | Rounds exhausted |
| 2 | Setup or chat error |
| 3 | Tests green, but the held-out probe failed |

</section>

<section>

## <span class="h2-num">into five documents</span>The cause, as recorded

The explanation written down was that version 1.9.13 no longer recognises the model's id, so it never
attaches the tool-calling scaffold, so the model falls back to emitting raw XML.

There was real evidence behind it. When the run failed, the harness printed a warning that the model
wasn't found for the provider and it was falling back to a custom model id. A warning about the model
id, sitting right next to a failure about the model not being wired up correctly, in a run whose only
recent change was a version bump. It read as confirmation.

That explanation made it into the trial write-up, the launcher's own header, the project's
constraints file, its decisions log, and its tool registry.

</section>

<section>

## <span class="h2-num">reproduced in 46 seconds</span>The retest

Four days later, a different project on the same machine retested the launcher as part of an
unrelated tool inventory, and reproduced the failure in 46 seconds. Rather than stop at reproduction,
it ran controls.

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Path tested</span></th>
<th scope="col" class="axis">Tool call parsed</th>
<th scope="col" class="axis">File written</th>
</tr>
</thead>
<tbody>
<tr class="group"><th colspan="3" scope="colgroup">The server alone</th></tr>
<tr class="voice">
<th scope="row" class="name sub">/v1 direct, tools, non-streaming</th>
<td class="cell" data-axis="Tool call parsed"><span class="m met"></span><span class="sr">parsed</span></td>
<td class="cell" data-axis="File written"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
<tr class="why"><td colspan="3">The harness taken out of the path entirely, to establish that the server parses a tool call when one is sent to it.</td></tr>
<tr class="voice">
<th scope="row" class="name sub">/v1 direct, tools, streaming</th>
<td class="cell" data-axis="Tool call parsed"><span class="m met"></span><span class="sr">parsed</span></td>
<td class="cell" data-axis="File written"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
<tr class="why"><td colspan="3">The same again with streaming on, in case the transport was the difference. It wasn't.</td></tr>
<tr class="voice">
<th scope="row" class="name sub">/v1 direct, no tools</th>
<td class="cell" data-axis="Tool call parsed"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="File written"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
<tr class="why"><td colspan="3">No tools sent, so there is nothing to parse. Prose comes back, with no XML leak.</td></tr>
<tr class="group"><th colspan="3" scope="colgroup">Through the harness</th></tr>
<tr class="voice">
<th scope="row" class="name sub">little-coder + qwen3-coder-30b</th>
<td class="cell" data-axis="Tool call parsed"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="File written"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="3">The failing pair, reproduced in 46 seconds. Raw XML, nothing on disk.</td></tr>
<tr class="voice">
<th scope="row" class="name sub">little-coder + qwen3.5</th>
<td class="cell" data-axis="Tool call parsed"><span class="m met"></span><span class="sr">parsed</span></td>
<td class="cell" data-axis="File written"><span class="m met"></span><span class="sr">written</span></td>
</tr>
<tr class="why"><td colspan="3">Harness held constant, model swapped. Whatever is wrong, it is not the harness on its own.</td></tr>
<tr class="voice">
<th scope="row" class="name sub">little-coder + qwen3.5:latest, an unregistered id</th>
<td class="cell" data-axis="Tool call parsed"><span class="m met"></span><span class="sr">parsed</span></td>
<td class="cell" data-axis="File written"><span class="m met"></span><span class="sr">written</span></td>
</tr>
<tr class="why"><td colspan="3">The control. Only the id registration differs from the row above, and the warning fires either way.</td></tr>
</tbody>
</table>
<figcaption class="fig-cap">Six paths, and what each one holds constant. The three direct-to-server rows never write a file, so that axis stays open for them rather than counting as a pass. Only one pairing breaks, and the last two differ from each other in exactly one thing.</figcaption>
</figure>

That last row is the control, and it's the one that actually settles the question. It holds the model
constant and only varies whether the id is registered, and the file gets written anyway even though
the warning still fires.

So the warning was benign, and id resolution wasn't the cause of anything. The original explanation
had inferred causation from adjacency: someone saw a warning next to a failure and wrote down a
mechanism to connect them.

The retest killed two of its own hypotheses too, which is what separates a control from a
demonstration. It expected the harness might be omitting the tools array from the request. Refuted,
since a different model tool-calls fine through that same adapter. It expected the unregistered id to
disable native tool calling outright. Refuted by the control row itself.

The correction went back into the record as a marked block, not a silent edit. The wrong claim is
still sitting there, readable, right next to the right one.

</section>

<section>

## <span class="h2-num">1.9.11 against 1.9.13</span>The correction was a claim too

The retest's own write-up had been careful. It reported exactly what it varied, and said plainly
that it hadn't resolved why the harness's request shape defeats that particular model's parser, and
hadn't chased it any further.

What travelled outward from it was shorter: not the id, the model.

That compression is checkable, and it doesn't hold. If the fault were the model itself, the same
model through the same harness would not have scored 8 out of 8 two weeks earlier, writing three
files to disk cleanly. Same box, same model server, same alias, same command-line tool. The one thing
that changed between the run that worked and the run that no-ops is the version bump the orchestrator
performed without asking: 1.9.11 against 1.9.13.

<figure class="fig">
  <svg class="axis-fig" viewBox="0 0 660 236" role="img" aria-label="Between the benchmark run that scored 8 out of 8 and the delegation run that wrote nothing, four things were held constant: the box, the model server, the model alias, and the command-line harness. One thing changed: the harness version, from 1.9.11 to 1.9.13. On 1.9.11 the run scored 8 out of 8 and wrote three files. On 1.9.13 it exited 0 and wrote none.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="12" letter-spacing="0.05em" fill="var(--ink-dim)">BETWEEN THE RUN THAT WORKED AND THE RUN THAT NO-OPS</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <rect x="0" y="42" width="11" height="11" fill="none" stroke="var(--ink-dim)" stroke-width="1.5"></rect>
    <text x="24" y="52" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the box</text>
    <text x="648" y="52" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">unchanged</text>
    <rect x="0" y="70" width="11" height="11" fill="none" stroke="var(--ink-dim)" stroke-width="1.5"></rect>
    <text x="24" y="80" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the model server</text>
    <text x="648" y="80" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">unchanged</text>
    <rect x="0" y="98" width="11" height="11" fill="none" stroke="var(--ink-dim)" stroke-width="1.5"></rect>
    <text x="24" y="108" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the model alias</text>
    <text x="648" y="108" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">unchanged</text>
    <rect x="0" y="126" width="11" height="11" fill="none" stroke="var(--ink-dim)" stroke-width="1.5"></rect>
    <text x="24" y="136" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the command-line harness</text>
    <text x="648" y="136" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">unchanged</text>
    <rect x="0" y="154" width="11" height="11" fill="var(--bad)"></rect>
    <text x="24" y="164" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the harness version</text>
    <text x="648" y="164" text-anchor="end" font-family="var(--font-mono)" font-size="11.5" fill="var(--bad)">1.9.11 &#8594; 1.9.13</text>
    <line x1="0" y1="184" x2="648" y2="184" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="204" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">ON 1.9.11</text>
    <text x="330" y="204" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">ON 1.9.13</text>
    <text x="0" y="226" font-family="var(--font-display)" font-weight="700" font-size="20" fill="var(--loch)">8 out of 8</text>
    <text x="122" y="226" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">three files written</text>
    <text x="330" y="226" font-family="var(--font-display)" font-weight="700" font-size="20" fill="var(--bad)">exit 0</text>
    <text x="404" y="226" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">raw XML, no file written</text>
  </svg>
  <figcaption class="fig-cap">Four things held, one moved. Neither slogan survives this: not the id, which the control row already cleared, and not the model, which had scored 8 out of 8 on the same box two weeks earlier.</figcaption>
</figure>

The retest ran entirely on 1.9.13. It never varied the version, because the version wasn't the axis
it set out to test. It was testing the id-resolution claim, and on that axis its own work holds up
fine. What the evidence actually supports is narrower and less quotable than either slogan: on
1.9.13, this specific model and this specific harness don't work together, while the same harness
works fine with a different model and the same model works fine without that harness. It's an
interaction. The mechanism behind it is still unknown.

| Theory | Evidence against | Verdict |
|---|---|---|
| Model id unregistered → tool-calling scaffold never attached | Control row: an unregistered id paired with a different model still writes the file, warning still fires | <span class="tag bad">Ruled out</span> |
| The model itself is at fault | Same model, same box, same alias scored 8 out of 8 under v1.9.11 two weeks earlier | <span class="tag bad">Ruled out</span> |
| The 1.9.11 → 1.9.13 version bump interacting with this specific model | Only variable that changed between the run that worked and the run that no-ops; mechanism still unknown | <span class="tag warn">Real cause</span> |

"The harness broke" was too broad a claim. "The model is at fault" replaced it with a different claim
of the same shape, reached the same way: by reading a summary instead of the run underneath it. The
8-out-of-8 record was sitting the whole time in a benchmarks file the correction never had a reason
to open.

</section>

<section>

## <span class="h2-num">four files, two missed</span>Two places the correction didn't reach

The correction was folded into four files. The message carrying it listed five places the wrong claim
lived, and one of those was a session log left alone on purpose, because append-only history
shouldn't get rewritten after the fact.

Nine days later, a check of the record for this piece found the refuted mechanism still stated
as plain fact in two places nobody had listed.

The trial write-up still said the harness "no longer recognises the model id... fails to attach the
tool-calling scaffold." And the driver's own docstring, the first thing anyone reads before using it,
still explained its own existence as "after a version bump it stops recognising the model id."

<p class="pull">The tool built because of the diagnosis was still carrying the diagnosis, after the
diagnosis itself had been withdrawn.</p>

<figure class="fig">
  <svg class="bound-fig" viewBox="0 0 660 216" role="img" aria-label="A boundary drawn around the five places the correction believed it had to reach: four were corrected, and the fifth, a session log, was left alone on purpose because append-only history is not rewritten. Two more places sat outside that boundary, never on anyone's list, and were found nine days later: the trial write-up and the driver's own docstring. Four plus one plus two is seven places, not five.">
    <text x="0" y="12" font-family="var(--font-mono)" font-size="12" letter-spacing="0.05em" fill="var(--ink-dim)">WHERE THE CLAIM ACTUALLY LIVED</text>
    <line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
    <rect x="0" y="40" width="380" height="114" fill="none" stroke="var(--loch)" stroke-width="1"></rect>
    <text x="14" y="62" font-family="var(--font-mono)" font-size="12" fill="var(--loch)">the list, made from memory</text>
    <rect x="14" y="76" width="60" height="13" fill="var(--loch)"></rect>
    <rect x="86" y="76" width="60" height="13" fill="var(--loch)"></rect>
    <rect x="158" y="76" width="60" height="13" fill="var(--loch)"></rect>
    <rect x="230" y="76" width="60" height="13" fill="var(--loch)"></rect>
    <rect x="302" y="76" width="60" height="13" fill="none" stroke="var(--ink-dim)" stroke-width="1" stroke-dasharray="3 2"></rect>
    <text x="14" y="110" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">four corrected; the fifth a session</text>
    <text x="14" y="126" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">log, left alone on purpose, because</text>
    <text x="14" y="142" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">it is append-only history</text>
    <line x1="400" y1="36" x2="400" y2="158" stroke="var(--ink-dim)" stroke-width="1" stroke-dasharray="4 4"></line>
    <text x="420" y="62" font-family="var(--font-mono)" font-size="12" fill="var(--bad)">never on anyone's list</text>
    <rect x="420" y="76" width="60" height="13" fill="var(--bad)"></rect>
    <rect x="492" y="76" width="60" height="13" fill="var(--bad)"></rect>
    <text x="420" y="110" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">the trial write-up, and</text>
    <text x="420" y="126" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">the driver's own docstring,</text>
    <text x="420" y="142" font-family="var(--font-mono)" font-size="11.5" fill="var(--ink-dim)">found nine days later</text>
    <line x1="0" y1="176" x2="648" y2="176" stroke="var(--rule)" stroke-width="1"></line>
    <text x="0" y="202" font-family="var(--font-mono)" font-size="13" fill="var(--ink-dim)">4 corrected  +  1 spared  +  2 never listed  =</text>
    <text x="372" y="204" font-family="var(--font-display)" font-weight="700" font-size="22" fill="var(--bad)">7</text>
    <text x="398" y="202" font-family="var(--font-mono)" font-size="13" fill="var(--ink-dim)">places, not five</text>
  </svg>
  <figcaption class="fig-cap">The counts were never the point. The boundary was. Four of five reached is a tidy result against a set that was wrong at its edge, and a set that is wrong at the edge cannot be checked by looking at what is inside it.</figcaption>
</figure>

Not because anyone ignored the correction. Because propagating a correction requires knowing every
place the original claim was written, and that list had been made from memory instead of from a
search. Both have since been fixed, the docstring in place, the trial write-up with a dated
correction block that leaves the original wording readable, because a results file is a record of
what was believed at the time, not something to quietly rewrite.

The real question isn't how two copies were missed. It's why anyone thought four was the complete
set. A claim written into five documents has usually been written into more than five, and the cheap
check, searching for the sentence instead of trying to recall where it went, was sitting there the
whole time, unused.

</section>

<section>

## <span class="h2-num">the smallest surface</span>What actually carries over

The smallest surface wins twice here, not once. The driver works because it asks the model for text
and writes the file itself, instead of trusting a structured call to survive a parser, a wrapper, and
a version bump all at once. The same instinct applies to how the record of what happened gets kept.
Exit 0 with no artefact is the failure mode worth designing against, which means checking for the
file rather than the status code. Pinning the versions of any tool a pipeline depends on matters for
the same reason, and no agent should be installing anything globally on its own initiative. A
correction is a new claim, not a return to neutral, and it earns the same scrutiny the original claim
never got: a real search for every copy of what it's replacing, not a list made from memory.

</section>
