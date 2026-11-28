---
layout: post.njk
title: The test that passed a bug
kicker: Field notes / verification
standfirst: >-
  A build shipped a bug its own tests had marked as passing. The tests came from the same process
  as the code, so they shared its blind spot. Only a verifier that never read them caught it.
description: >-
  A two-round A/B trial of an anti-laziness skill for coding agents, judged by a third agent
  working blind from the original spec. Round one cost 2.5x wall time for no measurable benefit.
  Round two cost 4.7x and caught a bug the baseline build's own tests had signed off on.
date: 2026-11-28
bylineTags: ["blind verification", "tool trials"]
permalink: /the-test-that-passed-a-bug/
---
<style>
  /* Two figures, both inline SVG, both hairline: the house diagram medium (BRAND, Layout).
     Figure 1 is a branch — one spec read twice, once by the build and once by a verifier — which
     is a topology, not a row, a bar or a label, so no base device reaches it.
     Figure 2 is grouped horizontal bars: three cost axes across two rounds is six quantities, and
     .ratio holds two; .ledger and .trials score outcomes rather than magnitudes. Same grammar as
     the tradeoff scatter in the-verdict-that-survived-its-own-correction — hairline axes, no
     gridlines, no fill panel. Loch is series 1 (round 1), moss series 2, per BRAND's .ratio
     convention. Bars are to scale on a shared 0-to-5x axis and every value drawn is printed in
     the prose above them.
     The key sits below the chart as HTML rather than SVG text, so its type stays at real size
     when the chart scales down on a phone. It carries each round's OUTCOME, which is the
     comparison the figure exists to make — remove it and the chart is six numbers with no verdict
     attached. Hairlines only, no fill, no radius, so R4 cannot apply. */
  .fig svg { display: block; width: 100%; height: auto; }
  .fig-lab { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.05em; fill: var(--ink-dim); }
  .fig-node { font-family: var(--font-mono); font-size: 13px; fill: var(--ink); }
  .fig-node.s1 { fill: var(--loch); }
  .fig-node.s2 { fill: var(--moss); }
  .fig-node.dim { fill: var(--ink-dim); }
  .fig-note { font-family: var(--font-mono); font-size: 11.5px; fill: var(--ink-dim); }
  .fig-tick { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.03em; fill: var(--ink-dim); }
  .fig-val { font-family: var(--font-mono); font-size: 11.5px; fill: var(--ink); }
  .fig-axis { stroke: var(--rule); stroke-width: 1; fill: none; }
  /* The 1x reference is drawn last, over the bars, not behind them. Behind, it only showed in the
     gaps between groups and read as an artefact — every bar is longer than 1x, so the one place it
     has to be legible is exactly where a bar covers it. --ink-dim carries on both the canvas and
     the bar fills; --rule does not. */
  .fig-ref { stroke: var(--ink-dim); stroke-width: 1; fill: none; }
  .fig-wire { stroke: var(--rule); stroke-width: 1.5; fill: none; }
  .fig-bar.s1 { fill: var(--loch); }
  .fig-bar.s2 { fill: var(--moss); }
  .rounds-key { margin-top: 20px; border-top: 1px solid var(--rule); }
  .rounds-row {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 13px 0; border-bottom: 1px solid var(--rule);
  }
  .rounds-swatch { flex: none; width: 11px; height: 11px; margin-top: 5px; }
  .rounds-swatch.s1 { background: var(--loch); }
  .rounds-swatch.s2 { background: var(--moss); }
  .rounds-row b {
    font-family: var(--font-mono); font-weight: 500; font-size: 13px;
    color: var(--ink); display: block; line-height: 1.4;
  }
  .rounds-row span {
    font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.02em;
    line-height: 1.5; color: var(--ink-dim); display: block; margin-top: 3px;
  }
  /* Mobile type inside the SVGs. Measured, not assumed: at 390px the chart renders 354px wide
     against a 656-unit viewBox, so everything scales to 54% and 13px figure type lands at ~7px on
     an actual phone. Both figures are laid out with enough horizontal slack to absorb the wider
     text these sizes produce — checked for collision and viewBox clipping at 390, 375 and 320px.
     The desktop sizes are unchanged; this only fires where the shrink actually happens. */
  @media (max-width: 560px) {
    .fig-lab { font-size: 15px; }
    .fig-node { font-size: 15px; }
    .fig-note { font-size: 15px; }
    .fig-val { font-size: 15px; }
    .fig-tick { font-size: 15px; }
  }
</style>

<section class="lead">

The tool was <span class="entity">unlazy</span>, an anti-laziness skill for coding agents (Claude
Code, Codex, Cursor) that gates file changes behind discipline checks, offers an optional Stop hook
(a mechanism that can block a session from finishing until its own checks pass) as an enforcement
layer, and can decompose a larger build into an orchestrated tree of sub-tasks. It surfaced the same
way a lot of noise does: an Instagram reel with a repo link. Most of those don't survive a second
look. This one did. A repository, a README, a terminal on screen, a named developer. Nothing hidden.
A direct read of its two Node scripts, <code>stop-hook.mjs</code> and <code>install-hooks.mjs</code>,
confirmed it: no network calls, no obfuscation, the hook installer scoped to the project by default
rather than reaching for anything global.

Clean enough to be worth an opinion. The request was for something stronger than an opinion: a
trial.

</section>

<section>

## <span class="h2-num">a trial, not a vibe check</span>Designing an experiment instead of forming an impression

The obvious way to trial a discipline tool is to run it once, read the output, and decide whether
it feels more careful. That's not a trial, it's a vibe check, and it's exactly the kind of soft
verdict this hub tries to avoid. So the design went further: two conditions, run per round. A
baseline build, doing the task the ordinary way. A second, disciplined build, running under
<span class="entity">unlazy</span>'s own gates. Same task, same prompt, dispatched into two isolated
scratch folders.

Then the part that matters. Neither build graded itself. A third, independent agent verified both
outputs instead, handed only two neutrally-named folders, explicitly told never to open either
build's own self-report or test files, and instructed to test live behaviour itself rather than
trust anything either build claimed about its own work.

</section>

<section>

## <span class="h2-num">2.5x for nothing</span>Round 1: a null result

The first round was deliberately easy, a 3-page site with form validation and a responsive layout.
The blind verifier found both builds functionally equivalent: every requirement passed, on both.
The disciplined build cost roughly 2.5x the wall time, 1.9x the tool calls, and 1.4x the tokens of
the baseline, for zero measurable benefit.

That's not a footnote to bury. It's the shape of the result: the task was small enough that
a careful single pass already got it right, which is exactly the case
<span class="entity">unlazy</span>'s own README admits it isn't built to help with. A trial that
only reports the round where the tool wins isn't a trial. It's marketing with extra steps.

</section>

<section>

## <span class="h2-num">the tests agreed with the bug</span>Round 2: the test that lied

The second round raised the difficulty on purpose: a CSV-to-JSON command-line tool with fifteen
distinct edge cases to handle correctly, built under <span class="entity">unlazy</span>'s
orchestrated mode, the build broken into a tree of sub-tasks four layers deep. Same structure.
Baseline and disciplined build, dispatched blind, verified by a third agent that had no access to
either build's own account of itself.

This time the blind verifier didn't just re-run existing checks. It wrote its own fixtures from
scratch, working from the original requirements rather than either build's interpretation of them.
That's what caught it: a reproducible bug in the baseline build. A trailing blank line at the end
of the input file threw an error instead of being silently ignored, exactly the kind of edge case
a spec-writer expects a competent tool to handle. The disciplined build handled it correctly.

Here's the part that makes it more than a bug report. The baseline build's own, self-authored test
suite had reported that exact case as passing. The code was wrong, and the tests written by the
same process that wrote the code agreed with it.

<figure class="fig">
<svg viewBox="-4 -4 656 232" role="img" aria-label="Cost of the disciplined build in each round, as a multiple of that round's own baseline. Round one: 2.5 times the wall time, 1.9 times the tool calls, 1.4 times the tokens. Round two: 4.7 times the wall time, 4.2 times the tool calls, 1.6 times the tokens.">
  <text x="0" y="12" class="fig-lab">COST, AS A MULTIPLE OF EACH ROUND'S OWN BASELINE</text>
  <line x1="0" y1="22" x2="648" y2="22" class="fig-axis" />
  <line x1="110" y1="36" x2="110" y2="196" class="fig-axis" />
  <text x="0" y="64" class="fig-lab">WALL TIME</text>
  <rect x="110" y="44" width="225" height="13" class="fig-bar s1" />
  <text x="344" y="54" class="fig-val">2.5x</text>
  <rect x="110" y="63" width="423" height="13" class="fig-bar s2" />
  <text x="542" y="73" class="fig-val">4.7x</text>
  <text x="0" y="122" class="fig-lab">TOOL CALLS</text>
  <rect x="110" y="102" width="171" height="13" class="fig-bar s1" />
  <text x="290" y="112" class="fig-val">1.9x</text>
  <rect x="110" y="121" width="378" height="13" class="fig-bar s2" />
  <text x="497" y="131" class="fig-val">4.2x</text>
  <text x="0" y="180" class="fig-lab">TOKENS</text>
  <rect x="110" y="160" width="126" height="13" class="fig-bar s1" />
  <text x="245" y="170" class="fig-val">1.4x</text>
  <rect x="110" y="179" width="144" height="13" class="fig-bar s2" />
  <text x="263" y="189" class="fig-val">1.6x</text>
  <line x1="200" y1="36" x2="200" y2="196" class="fig-ref" stroke-dasharray="3 4" />
  <text x="200" y="211" text-anchor="middle" class="fig-tick">1x baseline</text>
</svg>
<div class="rounds-key">
  <div class="rounds-row">
    <span class="rounds-swatch s1"></span>
    <div><b>Round 1 &middot; the easy task</b><span>3-page site, form validation, responsive layout. Builds equivalent, no measurable benefit.</span></div>
  </div>
  <div class="rounds-row">
    <span class="rounds-swatch s2"></span>
    <div><b>Round 2 &middot; the hard task</b><span>CSV-to-JSON CLI, 15 edge cases, tree depth 4. Baseline shipped a bug its own tests missed; disciplined build caught it.</span></div>
  </div>
</div>
<figcaption class="fig-cap">All costs relative to that round's baseline build (1x). Every multiplier rose in round two, and only in round two did the extra cost buy anything.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">one reading, two products</span>Why the verifier had to be blind

This is the actual finding, and it isn't about <span class="entity">unlazy</span> at all. When one
process writes both the
implementation and the tests for it in the same continuous pass, the tests
inherit whatever the implementation got wrong. If the code never considered a trailing blank line,
the tests it writes for itself won't consider one either, not because of carelessness, but because
both the mistake and the blind spot came from the exact same reasoning.

<p class="pull">A test suite written by the code's own author can confirm the code does what its author thinks it does. It can't tell you what its author never thought of.</p>

<figure class="fig">
<svg viewBox="-4 -4 656 232" role="img" aria-label="One spec, read twice. From the original requirements, the build produces both the implementation and the tests for it: one process, one reading. Also from the original requirements, a blind verifier produces its own fixtures: a second, separate reading.">
  <text x="0" y="12" class="fig-lab">WHERE THE BLIND SPOT COMES FROM</text>
  <line x1="0" y1="22" x2="648" y2="22" class="fig-axis" />
  <text x="0" y="40" class="fig-node dim">the original requirements</text>
  <line x1="14" y1="58" x2="14" y2="180" class="fig-wire" />
  <line x1="14" y1="96" x2="34" y2="96" class="fig-wire" />
  <text x="40" y="100" class="fig-node s1">the build</text>
  <line x1="130" y1="96" x2="152" y2="96" class="fig-wire" />
  <line x1="152" y1="74" x2="152" y2="118" class="fig-wire" />
  <line x1="152" y1="74" x2="172" y2="74" class="fig-wire" />
  <line x1="152" y1="118" x2="172" y2="118" class="fig-wire" />
  <text x="178" y="78" class="fig-node">the implementation</text>
  <text x="178" y="122" class="fig-node">the tests for it</text>
  <text x="40" y="146" class="fig-note">one process, one reading</text>
  <line x1="14" y1="180" x2="34" y2="180" class="fig-wire" />
  <text x="40" y="184" class="fig-node s2">a blind verifier</text>
  <line x1="194" y1="180" x2="216" y2="180" class="fig-wire" />
  <text x="222" y="184" class="fig-node">its own fixtures</text>
  <text x="40" y="216" class="fig-note">a second, separate reading</text>
</svg>
<figcaption class="fig-cap">The implementation and the tests for it are siblings: one process read the spec once and produced both, which is why they agree. The verifier's fixtures descend from the same requirements by a different route, so they have no reason to share the mistake.</figcaption>
</figure>

Re-running the builder's own tests against a second build proves nothing about that gap. It just
re-asks the same question the builder already answered. A verifier that works from the original
spec instead, with no visibility into either build's self-report, has no reason to share that
blind spot. That's the only reason round 2 produced a decisive result instead of two builds that
both claimed to pass.

</section>

<section>

## <span class="h2-num">what this didn't prove</span>What this piece owes the reader

One thing this trial did not confirm, and shouldn't be allowed to quietly imply: whether
<span class="entity">unlazy</span>'s own Stop hook actually engaged during either round. Both builds
ran as subagent dispatches inside an existing session, not as fully separate Claude Code sessions.
Whether that dispatch path goes through the same hook pipeline a separately-launched session would
use is unconfirmed. An unrelated authentication limitation on the machine running the trial ruled
out a true isolated-session test. Not a choice.

So the finding here is narrower than "<span class="entity">unlazy</span>'s hook mechanism improved
the output," and should be
reported that way. What the trial actually demonstrated is that a build carried out under
<span class="entity">unlazy</span>'s discipline (whatever combination of prompt framing, gates, and
possibly hook enforcement produced it) caught something the baseline build and its own tests missed.
It's the <em>method</em> of blind, spec-driven verification that surfaced it. Whether the hook
itself was the load-bearing mechanism is an open question this trial can't answer, and this piece
says so rather than rounding up to a cleaner story.

</section>

<section>

## <span class="h2-num">task-shaped, not blanket</span>The verdict

Filed as trialled, not adopted outright and not dismissed. The real, disclosed limitation above
means it can't be filed as a clean mechanistic win. But the result that did survive verification is
real: on a task with enough discrete edge cases that a careful single pass, and a self-authored
test suite, can plausibly miss one, the disciplined build caught something the baseline confidently
got wrong. On the easy round, it added cost for nothing. The recommendation is task-shaped,
not blanket: worth reaching for on multi-edge-case builds, not worth it on anything a single
careful pass already handles well.

</section>

<section>

## <span class="h2-num">the pattern, not the tool</span>It generalizes past this one tool

The reusable part isn't the specific tool, it's the verification pattern: a blind agent, working
from the original spec, that writes its own fixtures instead of re-running whatever the build
under test already claims passes. Any tool that markets itself as improving completeness or
correctness deserves exactly this kind of check before its claim gets believed, because the
alternative, letting a build (or its author) grade its own homework, is precisely the setup that
let a bug slip past the very test suite meant to catch it.

</section>
