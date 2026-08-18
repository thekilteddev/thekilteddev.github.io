---
layout: post.njk
title: Invoked, not executed
kicker: Field notes / orchestration
standfirst: >-
  A compliance check said the research harness fired in half the runs. The runs it passed had
  quietly skipped the one step that check existed to guarantee. Invoking a thing and running it
  are different claims.
description: >-
  A routing rule meant to stop a deep-research request from burning a five-hour usage window, a
  test of the fix that passed in half the runs, and why invoking a research harness and running it
  are two different claims.
date: 2026-08-17
bylineTags: ["orchestration", "routing"]
permalink: /invoked-not-executed/
---

<section class="lead">

A deep-research request to the top-tier model tore through three consecutive five-hour usage windows &mdash; the rolling quota Claude enforces before a session has to stop and reset &mdash; to answer a single question.

<style>
  /* Three series, not two. Three consecutive windows were spent and dropping any one of them to
     fit base.njk's two-column .ratio would understate the total, which is the whole point of the
     cold open. Same override the-verification-tax uses for the same reason — grid and width only,
     bar colours, key type and the baseline rule all stay on the shared component. */
  .ratio.three, .ratio-key.three { grid-template-columns: repeat(3, 1fr); max-width: 460px; }
</style>

<figure class="fig">
  <div class="ratio three">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 54%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 40%"></div></div>
  </div>
  <div class="ratio-key three">
    <div><b>54%</b><span>window 1 &middot; two minutes</span></div>
    <div><b>100%</b><span>window 2 &middot; four minutes</span></div>
    <div><b>40%</b><span>window 3</span></div>
  </div>
  <figcaption class="fig-cap">Three consecutive five-hour usage windows, against one question. They add up to 194% &mdash; nearly two entire windows &mdash; and the first two were gone inside six minutes.</figcaption>
</figure>

Nobody had done anything unusual. Someone had just asked the model to look something up properly.

[The routing policy this machine runs on](/route-dont-guess/) has a rule for exactly this shape of task: work that's
one step (search, fetch a source, extract a claim) and objectively checkable belongs on the
cheapest tier that can do it, not on the model that costs the most per token. Deep research is
built entirely out of that shape: search, fetch, extract, feeding a synthesis step that does need
judgment. The rule already existed. It just never had a chance to apply.

</section>

<section>

## <span class="h2-num">no decision point</span>Why the rule never fired

A routing policy only engages at a decision point: the moment a session has to choose which tier
does the next piece of work. Most of the policy's machinery assumes that moment exists. A plan
gets broken into tasks, and each task is a place to ask who does this.

A direct request, "deep-research this," skips all of that. It's answered as one thing, by
whichever model receives it, in whichever way that model has of doing research. There's no task
list to route pieces of. The search, the fetching, the extraction, the verification all happen
inside a single reply from the most expensive available model, because nothing ever asked whether
the next step needed to be there.

The fix follows from the gap. Route research-shaped requests through a harness that does the
decomposing on the way in, whatever words were used to ask. That covers all three shapes the ask
takes: an explicit "research this," a model deciding on its own that a claim needs checking, or
something as soft as "I'm not sure what's actually true here." All three land in the same place if
answered directly. All three should hit the harness instead.

</section>

<section>

## <span class="h2-num">3 phrasings, 2 tiers</span>The test

Having independently found an adjacent problem (a third-party tool doing something similar had
its own bug in the budget cap meant to prevent exactly this kind of burn), a sibling project was
asked to check whether the routing fix triggered in practice. Six blind subagents, no shared
context, one prompt each: three ways of asking for the same research, crossed with two model
tiers. The topic was held constant — the enforcement status of the EU AI Act — so how the question
was worded was the only deliberate variable.

The intended way of measuring it failed. A subagent's own transcript file stays zero bytes even
after the run has finished, so nobody could simply read off which tools had been called. The
measurement fell back to asking each subject afterward what it had done, cross-checked against a
tool-call count the harness reports and the agent has no hand in writing.

<p class="pull">The harness fired in half the runs. That looked like a pass. It wasn't one.</p>

</section>

<section>

## <span class="h2-num">invoked, not executed</span>What "invoked" was hiding

Every run that triggered the harness received an instruction to call `Workflow`, the dispatcher
that fans the research out across sub-agents. `Workflow` is not available inside a delegated
subagent. Each of those runs found that out mid-task,
noticed the gap, and quietly did the research a different way: by hand, with the tools it did
have. Nothing crashed. Nothing logged an error. The final answer looked like a normal research
answer, because it was one. Just not the one the rule was written to guarantee.

One of the six was candid about exactly what was lost in translation. It had improvised its own
version of the harness's fan-out step, sending several of its own sub-agents out to search in
parallel, and reported the results converging as if that settled things. Asked afterward what its
own five-agent agreement was worth, it corrected itself before anyone pushed back:

<blockquote><p>The convergence I reported between agents is corroboration, not adversarial
verification — five agents drawing on an overlapping source pool can agree and still be wrong
together.</p></blockquote>

The step that was skipped wasn't a decoration. It was the one part of the harness whose entire job
is to catch exactly that kind of agreement that isn't evidence. A rule checking whether the
harness was invoked would have called that run compliant. The harness had not, in the sense that
mattered, run at all.

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Run</span></th>
<th scope="col" class="axis">Harness invoked</th>
<th scope="col" class="axis">Fan-out executed</th>
</tr>
</thead>
<tbody>
<tr class="voice">
<th scope="row" class="name">Explicit ask<span class="eng">sonnet</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="voice">
<th scope="row" class="name">Explicit ask<span class="eng">opus</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="voice">
<th scope="row" class="name">No keyword<span class="eng">sonnet</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
<tr class="voice">
<th scope="row" class="name">No keyword<span class="eng">opus</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
<tr class="voice">
<th scope="row" class="name">Soft / vague<span class="eng">sonnet</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m met"></span><span class="sr">met</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m broke"></span><span class="sr">broke</span></td>
</tr>
<tr class="voice">
<th scope="row" class="name">Soft / vague<span class="eng">opus</span></th>
<td class="cell" data-axis="Harness invoked"><span class="m broke"></span><span class="sr">broke</span></td>
<td class="cell" data-axis="Fan-out executed"><span class="m unrun"></span><span class="sr">never established</span></td>
</tr>
</tbody>
</table>
  <figcaption class="fig-cap">Invoked in three of six runs, executed in none. The three that invoked it reached for <code>Workflow</code>, which a delegated subagent cannot call, and fell back to research by hand; the three that never invoked it never got far enough to find out. The right-hand column is empty either way, and that column is the one the rule was written to guarantee.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">2 of 2, by coincidence</span>The number that looked best was the least trustworthy

The one wording that worked reliably, the explicit "deep-research this," didn't work because the
routing logic held. One of the successful runs said, unprompted, exactly why it had picked up on
the request. The words read to it as plain English, and it matched them to the right tool on its
own initiative. In its own account, the phrase was "hyphenated as a verb phrase," with "no slash,
no backticks, no skill syntax."

<p class="pull">Nothing in how it was written signalled a tool call.</p>

Rename the tool, or ask for the same research without those two words, and the coincidence that
made the easy case look solved stops holding.

The case that matters is a serious, specific question asked with no research vocabulary in it.
That is the shape almost every real research need takes, and it missed on every model tested.
That's the gap worth worrying about.

</section>

<section>

## <span class="h2-num">the easy half</span>What changed, and what didn't

The rule was rewritten to check for evidence the harness had actually run: a count of sub-agents
dispatched, a tally of claims independently verified, rather than trusting that the right words
had been said. That closes the failure mode the test found: a compliant-looking run that quietly
did none of the work the compliance was meant to certify.

It doesn't close the other one. The wording that reliably works is still the wording that happens
to match the tool's own name. The question that matters, the one with no research vocabulary in
it, misses the harness on both models tried.

Fixing what gets checked was the easy half. The other half is getting the harness to notice it is
needed at all, from a question that never says so. That one is still open, and the coincidence
that made the easy case look solved is the reason to expect it is the harder one.

<p class="open-note">The rule that got rewritten, extracted and de-identified: <a href="https://github.com/thekilteddev/routing-policy">the routing-policy repo</a>.</p>

</section>
