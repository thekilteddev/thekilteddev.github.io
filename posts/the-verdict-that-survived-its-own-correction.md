---
layout: post.njk
title: The verdict that survived its own correction
kicker: Field notes / local models
standfirst: >-
  An earlier project handed this one a verdict: a local model can't do iterative coding. A re-test
  came back 8 out of 8 in two minutes and seemed to overturn it. The verdict had been right all
  along. Its scope and its reason just never made the trip.
description: >-
  A verdict inherited from an earlier project, that a local model can't do iterative coding, was
  right the whole time. A re-test turned it into something broader and less true. How a correct
  conclusion loses its scope in transit, and the two mechanical rules that came out of catching it.
date: 2026-08-29
bylineTags: ["local models", "inherited conclusions"]
permalink: /the-verdict-that-survived-its-own-correction/
---

<style>
  /* Score-against-time scatter: two models, two measures, a real trade-off (fast vs. thorough)
     that two separate .ratio bars would have flattened into unrelated numbers. First use of an
     SVG figure on this site — CSS grid bars can position one quantity, not a genuine XY position.
     House no-container grammar carries over: hairline axes only, no gridlines, no fill panel.
     Loch is series 1 (qwen3-coder-30b, the model the piece leads with), moss is series 2, per
     BRAND's .ratio convention. Both axes start at 0 — the 0.5-point score gap reads as small
     because it is small; only the time axis is where the real gap lives.
     Revised (S25, second pass): the first version floated two unconnected dots with in-chart
     text at uneven heights — read as clumsy and, at small size, loch/moss don't separate enough
     on hue alone to read as "these two are being compared". Fixed with a connector spine (the
     structure itself says "measured against each other", not just proximity) and shape as a
     second identity channel (circle vs. square — composite hue x shape), plus in-chart text
     dropped in favour of an aligned two-column key below, same pattern as .ratio-key.
     Revised again (S25, third pass): the key row had a leftover max-width:460px from an earlier
     layout while the SVG itself (no width cap) stretches to the full prose column — the two
     were never the same width, which read as everything crammed left. Fixed by giving both the
     same box and aligning the key's edges to the axis's actual x-coordinates (44 and 436 out of
     the 460-wide viewBox, expressed as percentages so they track the SVG's rendered width at any
     viewport) rather than eyeballing a fixed pixel value that only happened to work at one size. */
  .fig svg { display: block; width: 100%; height: auto; }
  .tradeoff-spine { stroke: var(--rule); stroke-width: 1.5; }
  .tradeoff-axis { stroke: var(--rule); stroke-width: 1; }
  .tradeoff-dot { stroke: var(--bg); stroke-width: 2; }
  .tradeoff-dot.s1 { fill: var(--loch); }
  .tradeoff-dot.s2 { fill: var(--moss); }
  .tradeoff-tick {
    font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.03em; fill: var(--ink-dim);
  }
  .tradeoff-key {
    display: flex; justify-content: space-between;
    box-sizing: border-box; width: 100%;
    padding: 0 5.217% 0 9.565%; /* 24px and 44px of the 460px viewBox, as percentages */
    margin-top: 16px;
  }
  .tradeoff-key-col { display: flex; align-items: flex-start; gap: 9px; }
  .tradeoff-swatch { flex: none; width: 11px; height: 11px; margin-top: 4px; }
  .tradeoff-swatch.s1 { border-radius: 50%; background: var(--loch); }
  .tradeoff-swatch.s2 { background: var(--moss); }
  .tradeoff-key b {
    font-family: var(--font-mono); font-weight: 500; font-size: 13px;
    color: var(--ink); display: block;
  }
  .tradeoff-key-value {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.02em;
    color: var(--ink-dim); display: block; margin-top: 2px;
  }
</style>

<section class="lead">
<p>This project started with a conclusion already sitting in its lap. In June, an earlier stretch of
work on the same machine had tested whether a local model could handle iterative coding: writing
files, running tests, fixing what broke, without a human shuttling text between a chat window and
an editor. The verdict was no. Not viable. That was the finding the whole project was built on.</p>
<p>On 4 July, someone re-tested it. It fell over in about two minutes.</p>
<p>The interesting part isn't that the verdict was wrong. It's that the verdict was right. It had
been stated precisely, with its own explanation attached, and none of that survived the trip into
the new project.</p>
</section>

<section>

## <span class="h2-num">8/8 in 2.1 minutes</span>The re-test

The task was a word search game: three files, a 10x10 grid, eight words hidden horizontally,
vertically or diagonally, click-and-drag to select, correct words struck through in the list, a
New Game button. Eight scored criteria. The eighth is the one that matters: ask for one follow-up
fix (make found words green) and check it lands without breaking the drag highlighting that
already worked. That regression check is what had killed every previous run.

Run through <span class="entity">little-coder</span>, a small harness that gives the model real
write and read tools instead of asking it to print code into a chat window, against
`qwen3-coder-30b` served by <span class="entity">Ollama</span>, the result was 8 out of 8 in 2.1
minutes. The follow-up fix took another 30 seconds. All of it verified in a real browser with
simulated drag events, not taken from the model's own account of what it had done.

The same benchmark against the smaller `qwen3.5-9b` scored 7.5 out of 8 in 44.1 minutes. It lost
half a point on reverse-placed and diagonal words: no reversed-string check, an off-by-one in the
highlight loop. It still passed the regression test, the first local setup here to manage that.

<figure class="fig">
<svg viewBox="0 0 460 178" role="img" aria-label="Score plotted against time to complete: qwen3-coder-30b scored 8 out of 8 in 2.1 minutes; qwen3.5-9b scored 7.5 out of 8 in 44.1 minutes.">
  <line x1="44" y1="16" x2="44" y2="150" class="tradeoff-axis" />
  <line x1="44" y1="150" x2="436" y2="150" class="tradeoff-axis" />
  <text x="36" y="20" text-anchor="end" class="tradeoff-tick">8</text>
  <text x="36" y="154" text-anchor="end" class="tradeoff-tick">0</text>
  <text x="44" y="166" text-anchor="start" class="tradeoff-tick">0</text>
  <text x="436" y="166" text-anchor="end" class="tradeoff-tick">48 min</text>
  <line x1="61" y1="16" x2="404" y2="24" class="tradeoff-spine" />
  <circle cx="61" cy="16" r="6" class="tradeoff-dot s1" />
  <rect x="398" y="18" width="12" height="12" class="tradeoff-dot s2" />
</svg>
<div class="tradeoff-key">
  <div class="tradeoff-key-col">
    <span class="tradeoff-swatch s1"></span>
    <div><b>qwen3-coder-30b</b><span class="tradeoff-key-value">8/8 &middot; 2.1 min</span></div>
  </div>
  <div class="tradeoff-key-col">
    <span class="tradeoff-swatch s2"></span>
    <div><b>qwen3.5-9b</b><span class="tradeoff-key-value">7.5/8 &middot; 44.1 min</span></div>
  </div>
</div>
<p class="fig-cap">Score against the time to finish a matching eight-criteria benchmark.<br>The
quality gap was only half a point: the time gap was a full 42 minutes.</p>
</figure>

Two honest marks sit against the 8 out of 8. One transient failure died with "Stream ended
without finish_reason" and an identical retry worked. On criterion 8, one green pixel was never
confirmed, because the preview tab had collapsed to a zero-width viewport and inline styles had
stopped applying: impossible in a real browser, so it was scored as a harness fault rather than a
code fault. That was a judgment call, made and written down as one at the time.

</section>

<section>

## <span class="h2-num">unaudited for two weeks</span>What this project wrote down that evening

The June verdict was a harness problem, not a model problem.

It's a clean line. It reads as an insight. It went into the project's working memory as a
headline finding, was quoted straight into the active constraints file, and shaped everything
scoped afterward: if the harness is the variable that matters, you invest in harnesses and stop
shopping for models.

The investment was right. The claim wasn't, and nobody checked it for two weeks, because a
conclusion that's useful and turning out well doesn't feel like it needs auditing.

</section>

<section>

## <span class="h2-num">one row of six use cases</span>What the original verdict actually said

The June work had been handed over as a document. Reading it properly, two weeks late, the
verdict is one row in a table of six use cases:

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Use case</span></th>
<th scope="col" class="axis">Locally viable</th>
</tr>
</thead>
<tbody>
<tr class="voice">
<th scope="row" class="name">Claude Code CLI backend</th>
<td class="cell" data-axis="Locally viable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="2">Models misinterpret Claude Code's own system prompt format. Not a config problem.</td></tr>

<tr class="voice">
<th scope="row" class="name">Multi-file document extraction<span class="eng">LM Studio + Gemma 4 E4B, 8192 ctx</span></th>
<td class="cell" data-axis="Locally viable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="2">Works well. The best multi-file result of anything tried.</td></tr>

<tr class="voice">
<th scope="row" class="name">Single-file extraction, agent + filesystem<span class="eng">Goose + Ollama, qwen3.5-9b</span></th>
<td class="cell" data-axis="Locally viable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="2">Works, but slow: 62 seconds per file.</td></tr>

<tr class="voice">
<th scope="row" class="name">Iterative coding<span class="eng">any local chat UI</span></th>
<td class="cell" data-axis="Locally viable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="2">Not viable, and structural: the five failure modes below, not a fixable bug.</td></tr>

<tr class="voice">
<th scope="row" class="name">Single-turn code generation<span class="eng">Goose or LM Studio, max context</span></th>
<td class="cell" data-axis="Locally viable"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="2">Viable, as a baseline handoff into a human editor.</td></tr>

<tr class="voice">
<th scope="row" class="name">Quota fallback for real sessions<span class="eng">fcc-server</span></th>
<td class="cell" data-axis="Locally viable"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="2">Routed to Gemini instead. Local wasn't trusted as the fallback.</td></tr>
</tbody>
</table>

<div class="key">
<span><span class="m met"></span> met</span>
<span><span class="m broke"></span> broke</span>
</div>

<figcaption class="fig-cap">June's headline verdicts, all six, from the same document that scoped iterative coding
to &ldquo;any local chat UI.&rdquo; The row that got re-tested is one of six, not the whole page.</figcaption>
</figure>

The scope is in the verdict line. Not "local models cannot do iterative coding." Local models
cannot do iterative coding in a chat UI, which is a claim about an interface.

Below it, five structural failure modes are listed. Stateless regression, where a fix in turn N
gets silently undone in turn N+1: observed, in that same word search task, as a drag highlighter
fixed and then broken. Overconfident reporting. Silent context truncation. Effective context not
matching advertised. No cross-session persistence.

And then, closing that section:

<blockquote><p>Why <span class="entity">Claude Code</span> avoids 1–2: tool-mediated verification per step, persistent conversation context — architecture, not raw model capability.</p></blockquote>

June had already worked out that the constraint was architectural. It's written down, in the
document that was handed over, in bold, five weeks before the July re-test that "discovered" it.

July didn't overturn June. July supplied the harness June had described, and measured what
happened.

</section>

<section>

## <span class="h2-num">the half that didn't hold</span>Where June was too optimistic

Of the five failure modes, June expected a harness to handle the first two: stateless regression
and overconfident reporting, both covered by tool-mediated verification and persistent context.

The first half held. The second didn't.

Overconfident reporting is a model claiming completion when a feature doesn't actually work, and
a harness only catches that if its tests are adversarial. This project has watched a weak test
launder a false claim into a green, twice. A redaction check passed with `assert "84210.55" not
in out` while a partially redacted amount, `842[AMOUNT]`, leaked straight through it. A loader
passed nineteen of nineteen with a leaked loop variable, masked by a fixture that only ever
exercised one file.

<p class="pull">Real file tools, persistent context, tests that ran green: both greens were wrong.</p>

So June wasn't simply more careful than its own summary. On this one point it was optimistic, and
the correction only turned up once this project built the harness June had described and ran it
long enough to get burned.

</section>

<section>

## <span class="h2-num">four variables, one real failure</span>What actually went wrong

Four things actually changed between June and July, worth stating because it means the re-test
was never a controlled experiment. The model changed. The harness changed. The runtime flags
changed (July ran with flash attention and a quantised key-value cache, June predated both). And
the prompt changed, because June's prompt text was never preserved and had to be rebuilt from
scratch.

That last one isn't carelessness. The June raw evaluation file survives, and it's 809 bytes: a
findings summary whose entire task description is one line. There was no prompt left to preserve
by the time anyone went looking. Reconstruction was the only option on the table.

But the four variables are a side issue. The real failure was compression.

What travelled from June into this project was the phrase "iterative coding not viable." The
scope, any local chat UI, didn't make the trip. Neither did the mechanism: architecture rather
than raw model capability.

Then someone re-tested the compressed form, found it wanting, and corrected it into a claim
broader and less accurate than the original. A precise, well-reasoned, correctly scoped verdict
went in one end and came out the other as a slogan, and the slogan is what the project ended up
arguing with.

<figure class="fig">
  <div class="stat-rows">
    <div class="stat-row">
      <div class="stat-name">The verdict, June</div>
      <p class="stat-desc">Iterative coding | Not viable (structural, see §5) | any local chat UI. Scoped to an interface, with its own mechanism named: architecture, not raw model capability.</p>
    </div>
    <div class="stat-row">
      <div class="stat-name">What travelled</div>
      <p class="stat-desc">&ldquo;Iterative coding not viable.&rdquo; The scope and the mechanism both stayed behind.</p>
    </div>
    <div class="stat-row">
      <div class="stat-name">What got re-tested</div>
      <p class="stat-desc">&ldquo;Harness, not model.&rdquo; Broader and less accurate than the verdict it replaced, and the claim this project ended up arguing with.</p>
    </div>
  </div>
  <figcaption class="fig-cap">A precise, scoped verdict compressed on the way in, then corrected on the way out, against a version of itself that had already lost its own scope.</figcaption>
</figure>

The handover document's own header says it plainly:

<blockquote><p>Nothing here needs re-deriving — it was all tested hands-on.</p></blockquote>

<p class="pull">This project re-derived it anyway, and ended up with a worse version.</p>

</section>

<section>

## <span class="h2-num">one failed lookup</span>The part that only appeared while writing this

Writing this piece meant going back to the June sources, and the first attempt to find them
failed. The active constraints file listed the handover document under a path in the other
project, the one that had written it. It wasn't there. Searching that project turned up nothing.

The conclusion drawn from that was that both June primaries had been deleted. That conclusion
went into a correction to this project's own files, into an early draft of this piece, and into a request
asking another project to recover them from git history.

The document was sitting in this project's own repository root. It had been there since the first
commit. It had been written elsewhere and moved across at handover, exactly as its own header
says. The raw evaluation file had moved into a shared knowledge vault during a migration weeks
earlier, and was just as findable. The other project located both files in minutes, and
mentioned, almost as an aside, that it has no git history at all, so the recovery being asked for
could never have worked anyway.

One failed lookup at one stale path became "gone from disk," and a fair amount was built on top
of that before anyone checked the obvious place.

<p class="pull">That's the same mistake this piece is about, made while writing about it.</p>

An absence, asserted from a single negative result. A conclusion, drawn from a summary (the path
in the constraints file) rather than from the thing itself.

</section>

<section>

## <span class="h2-num">two rules, both mechanical</span>What changed

The finding was rewritten to what the evidence actually carries. The harness thesis is June's,
not this project's, and it was right. What this project added is confirmation and a measurement.
The broad version, "harness, not model," is now marked as over-stated, because it took this
project's own later evidence, not June's, to find the one place a harness alone wasn't enough.

The practical guidance didn't change at all, which is the uncomfortable part. Invest in the
harness. Verify with real tool output. Keep the local tier for bounded work. All still correct,
all still what this project does. A claim can be over-stated and still point the right way, and
that combination is exactly what stops anyone from checking it again.

This isn't a new failure shape for this operation, either. A decision that outlives the reasons
behind it is the same mistake as <a href="/route-dont-guess/">a routing choice nobody
re-checks</a>. A conclusion asserted from one failed lookup is the same mistake as <a
href="/checks-that-cannot-fail/">a result scored green once and never looked at twice</a>. Both of
those have already been written about here. This is just the first time the mistake showed up in
the writing itself, not in the thing being written about.

Two rules came out of this, both narrow and mechanical. Before re-testing an inherited verdict,
read the primary document, not your own summary of it: an active-constraints file strips scope
and exceptions by design, because stripping detail is what it's for. And an absence needs more
than one failed lookup, especially when the path you searched came from the same compressed
source you're already re-deriving from.

What travels between sessions, projects and people is the conclusion. The conditions that
produced it stay behind. A conclusion without its conditions is a rumour with a number attached.

</section>
