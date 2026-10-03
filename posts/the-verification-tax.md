---
layout: post.njk
title: The verification tax
kicker: Field notes / orchestration
standfirst: >-
  Every task in a five-task build went to its own subagent, and the controlling session's context
  climbed anyway. Writing the brief beforehand and checking the report afterward are the same
  long, low-interaction work the dispatch never touched.
description: >-
  A routing rule said to background long, low-interaction work, so a five-task build dispatched
  every task to a subagent. The controlling session's context climbed anyway. Writing the briefs
  and checking the reports cost the same window, and no rule had priced either.
date: 2026-10-03
bylineTags: ["orchestration", "context budgets"]
permalink: /the-verification-tax/
---
<style>
  /* Three series, not two. The comparison this piece makes is one autonomous session against TWO
     human-gated ones, and dropping either gated session to fit base.njk's two-column .ratio would
     mean picking whichever number flattered the argument. Overrides the grid and its width only —
     bar colours, key type and the baseline rule all stay on the shared component's values. */
  .ratio.three, .ratio-key.three { grid-template-columns: repeat(3, 1fr); max-width: 460px; }
</style>

<section class="lead">

A session narrating its own work inline, no delegation, spent 78% of its context window across
two long stretches with almost no back-and-forth from whoever had asked for it. A separate
session, same shape, burned over a million tokens in one pass. Neither had done anything wrong.
Both had already made the right call on which model to use. They just ran the work themselves
instead of handing it off, and talked through every step on the way.

The fix looked obvious once it had a name: a task can be [the right tier](/route-dont-guess/) and still be the wrong
thing to run inline. Long, low-interaction work burns the same resource, the controlling
session's own context window, no matter which model is doing it or what that model costs.
Background it. Default to a brief checkpoint instead of a running commentary. Cheap rule, easy to
state, and it should have been the end of it.

</section>

<section>

## <span class="h2-num">5 tasks, none inline</span>Testing it on something real

The next real chance to watch the rule work was an actual five-task build: a search feature
threaded through several existing functions, tested live in a browser as each piece landed. Every
task went to a subagent with a full brief and a strict report contract: done, done with concerns,
blocked, pick one, or put the detail in a file rather than the reply. Exactly what the rule asked
for. Implementation never ran inline.

The controlling session's own context climbed anyway. Not dramatically, four points over about
three hours, but steadily, the whole time, driven by the same thing the rule was written to stop:
long stretches of low-interaction activity, just moved to a different part of the job.

</section>

<section>

## <span class="h2-num">two costs that stay</span>What moved into the gap

Dispatching the implementation only covers what happens inside the dispatch. It does nothing for
two costs that stay with the controller regardless of how well the dispatch is written.

One is the brief itself. A good dispatch spec spells out its constraints, the known gotchas, the
exact test sequences, on purpose, so the thing doing the work doesn't have to guess. That text
gets paid for twice: once to write, once for the controller to carry in its own history after
sending it.

The other is the check afterward. The controlling session read every report against the actual
diff, and independently re-tested several claims rather than taking them on trust. None of that
was delegated. It moved from doing the work to checking it, a category of cost the original rule
never named.

<figure class="fig">
  <div class="stat-rows">
    <div class="stat-row">
      <div class="stat-name">The brief</div>
      <p class="stat-desc">Constraints, known gotchas, exact test sequences. The controller writes it, then carries it for the rest of the run.</p>
    </div>
    <div class="stat-row">
      <div class="stat-name">The work</div>
      <p class="stat-desc">One subagent per task, each with a window of its own. The only phase the rule ever reached.</p>
    </div>
    <div class="stat-row">
      <div class="stat-name">The check</div>
      <p class="stat-desc">Every report read against the diff, several claims re-run. All of it back on the controller.</p>
    </div>
  </div>
  <figcaption class="fig-cap">Three phases in the build. Only the middle one ever left the controlling session.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">3 catches, no defects</span>The check wasn't wasted

If the fix had been "verify less," the numbers would look better and the build would be worse. The
verification pass caught three real problems in that one run. Twice, a report said something
hadn't worked when the code was fine and the test had failed for an unrelated reason. Once, a
report went quiet about a step it had skipped rather than saying so. None of the three was an
actual defect in the code. Someone caught all three only by checking instead of trusting the
report, and every one of them came out of work done by a cheaper, less careful process than the
one doing the checking.

<p class="pull">That's the tax nobody had priced yet: route the doing to something cheaper, and the checking gets more necessary, not less.</p>

And the checking is exactly the kind of long, low-interaction work the
rule already knew how to handle. Nobody had told it to.

</section>

<section>

## <span class="h2-num">2 gated sessions</span>A quieter comparison, running at the same time

Two other sessions were doing unrelated work in the same window, and both had something the build
above didn't have: a real stopping point built into the task itself, an approval gate in one case,
a direct question from whoever had started the session in the other. Neither ran anywhere near as
long unsupervised.

Both still climbed. Less than the fully autonomous build, meaningfully less, but nowhere near the
order of magnitude a "no human in the loop" story would predict. A handful of points of the same
resource, spent the same way, just less of it. Whatever drives the growth isn't only whether a
person was watching. It looks closer to how much a session writes and reads on its own, per turn,
regardless of who's nominally there.

<figure class="fig">
  <div class="ratio three">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 76.7857%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 67.3469%"></div></div>
  </div>
  <div class="ratio-key three">
    <div><b>39.2%</b><span>autonomous build</span></div>
    <div><b>30.1%</b><span>gated, direct question</span></div>
    <div><b>26.4%</b><span>gated, approval</span></div>
  </div>
  <figcaption class="fig-cap">Share of each session's total context budget held by its own message history, read off live context-window panels the same day. The autonomous build climbed from 35.3% to 39.2% across the run; the two gated sessions were read once each.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">one phase later</span>What changed, and what didn't

The rule that said background long inline work now covers long inline checking too: re-reading a
report, or re-running a live test to confirm a claim independently. Same resource, same fix, just
applied to a phase the rule hadn't reached yet.

It doesn't make the checking optional. The three catches in the test run are the argument against
that shortcut, not for it. The actual fix isn't spending less attention on verification. It's
spending that attention somewhere that doesn't cost the one session that has to stay coherent for
the whole build.

</section>
