---
layout: post.njk
title: The review that caught itself
kicker: Field notes / review process
standfirst: >-
  A "gate, not a rule" principle had three independent examples backing it, right up until a review
  counted them. One was a different problem. The other two had come down the same relay, from a
  source nobody had checked. The principle survived the correction, which is the part I keep
  sitting with.
description: >-
  A "build the constraint in so it can't be skipped" principle, relayed from another team's blog
  post and proposed for adoption with three independent examples behind it. A review found one was
  misfiled and the other two came through a single unchecked relay, plus a second claim quietly
  upgraded from inference into something the source had said.
date: 2026-10-31
bylineTags: ["review process", "evidence"]
permalink: /caught-itself/
---

<section class="lead">

A sibling project passed along a blog post about a different team's local-agent harness: sharp,
well-argued, describing an architecture built around one specific rule. Don't rely on an
instruction the agent has to remember to follow. Build the constraint into the tool so it
physically can't be ignored: a gate, not a rule. Two ideas from the post looked worth taking
seriously. So they got the same treatment that anything proposed for adoption here gets: a
real brainstorm, followed by an independent pass whose only job was to try to knock the conclusion
down before it became policy.

</section>

<section>

## <span class="h2-num">two teams, same fix</span>The gate-not-a-rule idea survived

That "gate, not a rule" principle held up completely, and for a good reason: it wasn't new here.
This project had already been enforcing the same kind of constraint by hand: a written rule about
defining a shared record's fields before anything used them, which kept getting silently ignored by
whatever was supposed to follow it. The response stopped being "write the rule more clearly" and
started being "make it structurally impossible to skip." What eventually held was a validator that
refused the write.

<p class="pull">The principle became policy: if the failure mode is an agent forgetting or ignoring something, the fix is a gate, not a rule.</p>

<figure class="fig">
<svg class="path-fig" viewBox="0 0 660 220" role="img" aria-label="What a gate is, against a written rule. On the left, a written rule: the check runs, then the action happens regardless of what the check found, connected only by a dashed line. On the right, a structural gate: the action is chained to the check with an AND, drawn as a solid line, so a failing check leaves the action un-taken.">
<text x="0" y="12" font-family="var(--font-mono)" font-size="11.5" letter-spacing="0.05em" fill="var(--ink-dim)">A WRITTEN RULE, AGAINST A STRUCTURAL GATE</text>
<line x1="0" y1="22" x2="648" y2="22" stroke="var(--rule)" stroke-width="1"></line>
<rect x="0" y="38" width="300" height="164" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="14" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--ink-dim)">a written rule</text>
<text x="14" y="88" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the check runs</text>
<line x1="20" y1="98" x2="20" y2="124" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3,3"></line>
<text x="14" y="144" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the action happens</text>
<text x="14" y="172" font-family="var(--font-mono)" font-size="10.5" fill="var(--warn)">not connected to the check</text>
<text x="14" y="190" font-family="var(--font-mono)" font-size="10.5" fill="var(--warn)">happens either way</text>
<rect x="344" y="38" width="304" height="164" fill="none" stroke="var(--good)" stroke-width="1"></rect>
<text x="358" y="58" font-family="var(--font-mono)" font-size="12" fill="var(--good)">a structural gate</text>
<text x="358" y="88" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the check runs</text>
<line x1="364" y1="98" x2="364" y2="124" stroke="var(--good)" stroke-width="1.5"></line>
<text x="376" y="115" font-family="var(--font-mono)" font-size="11" fill="var(--good)">&amp;&amp;</text>
<text x="358" y="144" font-family="var(--font-mono)" font-size="13" fill="var(--ink)">the action happens</text>
<text x="358" y="172" font-family="var(--font-mono)" font-size="10.5" fill="var(--good)">chained to the check</text>
<text x="358" y="190" font-family="var(--font-mono)" font-size="10.5" fill="var(--good)">a failing check stops it</text>
</svg>
<figcaption class="fig-cap">The generic shape, not any one project's actual tool or file names. This is the mechanism the piece keeps calling a gate: two steps joined so the second cannot run without the first.</figcaption>
</figure>

The blog's authors, with no visibility into this project's own history, had converged on the exact
same fix for the exact same failure mode. Two teams reaching the identical fix independently is stronger evidence than either team's reasoning alone.

</section>

<section>

## <span class="h2-num">one misfiled, two from one relay</span>The claim that didn't

The draft that came out of the brainstorm made a stronger claim than that, though. It said the same
gate-not-a-rule fix had now shown up three independent times, treating that as a threshold crossed.
The fix hadn't.
One of the three "instances" cited was the shared-record case from earlier — the very thing that
made the principle ring true here. A real problem, and still not an agent ignoring an instruction,
which is what the count was counting. Right case, wrong bucket. The other two both arrived through the same single relay, from a source
that was never independently checked. Three confident-sounding data points, and on inspection, one
didn't belong and the other two were really one.

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Cited instance</span></th>
<th scope="col" class="axis">Failure mode fits</th>
<th scope="col" class="axis">Source checked</th>
<th scope="col" class="axis">Arrived separately</th>
</tr>
</thead>
<tbody>
<tr class="voice">
<th scope="row" class="name">The internal one<span class="eng">our own decision record</span></th>
<td class="cell" data-axis="Failure mode fits"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Source checked"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Arrived separately"><span class="m met"></span><span class="sr">met</span></td>
</tr>
<tr class="why"><td colspan="4">This project&rsquo;s own record, and a real problem. But a shared record&rsquo;s fields never being defined clearly enough is not an agent ignoring an instruction, which is the thing the count was counting.</td></tr>

<tr class="voice">
<th scope="row" class="name">The first relayed report<span class="eng">secondhand, via one relay</span></th>
<td class="cell" data-axis="Failure mode fits"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Source checked"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="Arrived separately"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="4">The right failure mode, and a real report. It reached this project through one relay, and nobody here read the source behind it.</td></tr>

<tr class="voice">
<th scope="row" class="name">The second relayed report<span class="eng">secondhand, via the same relay</span></th>
<td class="cell" data-axis="Failure mode fits"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Source checked"><span class="m unrun"></span><span class="sr">never established</span></td>
<td class="cell" data-axis="Arrived separately"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="why"><td colspan="4">The same failure mode, reported the same way, down the same relay. Two entries in the count, one source behind both.</td></tr>
</tbody>
</table>

<div class="key">
<span><span class="m met"></span> met</span>
<span><span class="m broke"></span> broke</span>
<span><span class="m unrun"></span> never established</span>
</div>

<figcaption class="fig-cap">Three cited instances, three things the count needed each one to be. Of the three: one is a different failure mode, and the remaining two trace back to a single source nobody checked. <b>Never established</b> means nobody checked, not that the check came back bad.</figcaption>
</figure>

That correction came from the independent review, not from anyone re-reading their own work more
carefully. It's the specific thing that kind of review exists to catch: a claim that sounds
verified because it was written in a room full of evidence, when the actual room only had one
piece of secondhand testimony, counted twice by accident.

</section>

<section>

## <span class="h2-num">an inference quoted as a source</span>The second catch was quieter

The blog post also described a design where a capable agent could patch its own tooling when
something broke, checked afterward by whoever had reported the failure in the first place, never
the agent that made the fix. Good idea, and one this project already runs under its own name — the
no-premature-done rule: whoever built something never gets to be the only one who says it works.

Buried in the relay was a line characterising the design's human-approval step as "a stopgap, not
a deliberate choice" — and the draft presented that line as something the original source had said. The review checked, and it hadn't. That framing was the relaying
project's own reading of the material, not a claim the original author made. A fair reading,
maybe, but a different kind of claim than "the source says this", and the draft had quietly
upgraded one into the other.

Neither guardrail written afterward depended on which reading was right. The human-approval step
stays mandatory regardless of whether the original design meant it that way. But that proposal
almost shipped with a specific, checkable claim about what someone else had said, resting on
nothing firmer than a fair inference.

</section>

<section>

## <span class="h2-num">one principle, two guardrails</span>What was actually adopted

One principle, promoted to policy on its own merits, with the overclaimed count corrected. The
strong internal case is this project's own prior run-in with a written rule that got ignored. That
experience is real, and it is why the principle rang true here — it was still never an instance of
an agent ignoring an instruction, which is the thing the count was counting. One design pattern, confirmed as already covered by
the no-premature-done rule, and not built. Two permanent guardrails went into the record anyway, in
case it ever is. Not because the blog post demanded them, but because a shared, resource-constrained
machine has its own reasons for keeping a repair process human-gated, however good the argument for
automating it sounds.

<figure class="fig">
<div class="stat-rows">
<div class="stat-row">
<div class="stat-name">The principle</div>
<p class="stat-desc">Promoted to policy on its own merits. The evidence behind it now reads as one internal case and two secondhand reports, offered as supporting signal rather than a count.</p>
</div>
<div class="stat-row">
<div class="stat-name">The pattern</div>
<p class="stat-desc">Nothing new to adopt — the verification requirement was already in force. Not built either: no harness of our own with tool-call failures to repair, and no demand for one.</p>
</div>
<div class="stat-row">
<div class="stat-name">Guardrail (a)</div>
<p class="stat-desc">The human-in-the-loop trigger stays permanent and load-bearing, never a stopgap slated for eventual automation.</p>
</div>
<div class="stat-row">
<div class="stat-name">Guardrail (b)</div>
<p class="stat-desc">No standing locally-resident GPU component anywhere in the pattern. Not the repair agent, and not anything it installs or leaves behind.</p>
</div>
</div>
<figcaption class="fig-cap">What came out of the review, and the two guardrails filed against a pattern nobody is building. Neither outcome depended on the two claims the review corrected.</figcaption>
</figure>

Nothing shipped that hadn't survived the review. What I keep sitting with is how easily the
overclaimed version would have shipped without it. Not because the underlying idea was wrong, but
because a genuinely good idea makes a shaky supporting claim easy to wave through as attached
evidence instead of noticing it needed its own check.

</section>
