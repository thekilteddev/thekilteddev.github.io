---
layout: post.njk
title: The benchmark that disproved its own result
kicker: Field notes / local models
standfirst: >-
  An article claimed a coding-trained model follows structural rules better than a general one, and
  offered no measurements. This project built the eval instead. The first result confirmed the
  article cleanly, which is exactly why it was worth distrusting.
description: >-
  A coding-trained model against a general one on five structured-text tasks. The first run
  confirmed the claim, the raw output showed the checker was wrong, and the gap vanished on a
  reworded prompt.
date: 2026-09-10
bylineTags: ["local models", "evaluation"]
permalink: /the-benchmark-that-disproved-itself/
---

<style>
  /* The two tested models, pulled out of flowing prose onto their own lines, each larger and
     moss-coloured — same convention .entity already uses for a named evaluated entity, just given
     more visual weight since these two ARE the whole comparison the piece runs on. First use;
     scope stays local per BRAND.md's promote-on-second-use rule. No container: no border, no
     fill, no radius (R4) — the weight comes from type size and colour only.
     Named .mline, not .m — base.njk already owns a global bare .m (the ledger/trials 11x11 state
     mark). A scoped `.model-pair .m` rule still wins the properties it sets on specificity, but
     width/height fall through per-property to the global 11x11 rule since this rule never set
     them — caught on the actual render, not by the geometry gate (HTML, not SVG, out of scope
     for it). Renamed rather than patched, so a future edit to either rule can't silently collide
     again. */
  .model-pair { margin: 28px 0; }
  .model-pair .mline {
    display: block; font-family: var(--font-mono); font-size: 22px; font-weight: 600;
    color: var(--moss); line-height: 1.5; letter-spacing: -0.01em;
  }
  .model-pair .mline:not(:last-child) { margin-bottom: 10px; }
  .model-pair .role {
    display: block; font-family: var(--font-mono); font-size: 11px; font-weight: 400;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-dim); margin-top: 2px;
  }
</style>

<section class="lead">

An article came past claiming a two-year-old coding-trained model beats a newer general model at
editing structured text that isn't code. Its thesis, verbatim:

> A general chat model treats rules as more of a suggestion because it's optimized to sound
> helpful. A coding model treats rules as the whole point.

The article contained no measurements. Not weak measurements. None.

That's normally enough to close a review. This project turned it into a test instead, because the
claim has a property most of the genre lacks: it's narrow, it names a mechanism, and it's
falsifiable on hardware already sitting here. "Local models are better than you think" isn't
testable. "A coding-trained model follows structural rules more reliably than a general one" is a
Tuesday afternoon's work.

The test took a few hours. The result was clean, confirmed the article, and was wrong.

</section>

<section>

## <span class="h2-num">5 fixtures, 30 runs</span>The setup

Two models already pulled, no new downloads needed.

<div class="model-pair">
  <div class="mline">qwen3-coder-30b<span class="role">the coding-trained side</span></div>
  <div class="mline">qwen3:8b<span class="role">the general side</span></div>
</div>

The general side was chosen after checking its chat template directly through the runtime's own
API: a 1,723-character real ChatML template. That check mattered because another model on this box
ships a template that's just a passthrough, which silently degrades everything sent through it, and
picking that one by accident would have produced a large, fake, extremely publishable result.

Five fixtures, one per task type: JSON repair, YAML frontmatter, CSV cleanup, Docker log
extraction, markdown tables.

<p class="pull">These models are stochastic, and one run is an anecdote.</p>

So every fixture ran three times, thirty runs in total.

Every fixture gets an objective gate that is full-equality or parse-and-compare, never substring
matching. That distinction isn't pedantry. A substring check asking "does the output
contain the right value" passes an output that contains the right value and three wrong ones too.
This project has had weak tests pass broken local-model work before, twice, so the checkers are
written to be hostile.

Two deliberate choices worth naming. **Thinking mode off**, because on this box's qwen models it
either hides the answer inside a thinking block or gets rejected outright by the server. **Default
temperature** rather than the low temperature used for code generation, because the claim is about
how these models behave in ordinary use, and tuning the sampling toward precision would have
quietly answered a different question.

</section>

<section>

## <span class="h2-num">datetime, not string</span>The grader had a bug, and it found it before any model ran

The checkers are the ground truth in an evaluation like this. If the grader's wrong, every number
downstream is decoration. So `structured-text-eval.py` has a `--selftest` mode: known-correct answers fed to
each checker, with no model involved, before a single request goes out.

It failed on the YAML fixture, for a reason that would never have been noticed later.

The fixture asks a model to add one key to a YAML frontmatter block without disturbing anything
else, and the checker verified the untouched keys still matched, including a date field,
`2026-07-01`. YAML's parser doesn't return that as a string. It returns a `datetime.date` object,
because unquoted ISO dates are a date type in YAML. Comparing that object to the string
`"2026-07-01"` is always false.

The checker would have failed a perfectly correct answer, on every trial, for both models. The fix
is the `str()` in the line that guards those untouched keys, still sitting there today:

```python
if fm.get("title") != "Weekly Report" or str(fm.get("date")) != "2026-07-01" \
        or fm.get("tags") != ["ops", "weekly"]:
```

What matters is when it was caught: before the run, by a check written specifically to distrust the
grading logic, rather than after, when a mysterious YAML failure would have needed explaining and
might have been written up as a finding instead.

<p class="pull">The grading logic needs the same adversarial discipline as the thing it grades.</p>

It's code, and nobody reviews it, because it lives in the part of the experiment everyone treats as
infrastructure.

We have written about [checks like that](/checks-that-cannot-fail/) before. That check could only
ever come back green, whatever it was pointed at. This one had the same defect running the other
way, and would only ever have come back red.

</section>

<section>

## <span class="h2-num">15/15 vs 12/15</span>The first result confirmed the article

Thirty runs, and the coding model came out ahead.

<figure class="fig">
  <div class="trials">
    <div class="trial-h"></div>
    <div class="trial-h">qwen3-coder-30b</div>
    <div class="trial-h">qwen3:8b</div>
    <div class="trial-r">JSON repair</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">YAML frontmatter</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">CSV cleanup</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">Docker log extraction</div>
    <div class="trial yes">pass</div>
    <div class="trial no">fail</div>
    <div class="trial-r">markdown tables</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
  </div>
  <figcaption class="fig-cap">Every fixture, first run, three trials each (a mark stands for all three — every fixture's trials agreed). Four fixtures agree completely. One doesn't.</figcaption>
</figure>

That fixture was extracting every ERROR line from a Docker log into structured JSON. The coding
model scored 3 out of 3 there, the general model 0 out of 3.

Look at the shape of that. It isn't noisy. It isn't one unlucky trial. One model succeeded every
time and the other failed every time, on the fixture most about following a structural rule, which
is exactly the mechanism the article named. A clean, consistent, mechanism-matching split, in the
predicted direction.

<p class="pull">That's what a real finding looks like. It's also what this one looked like, and it
was a bug in the fixture itself.</p>

</section>

<section>

## <span class="h2-num">15/15 vs 15/15</span>What the raw output actually said

The harness records every output verbatim rather than just pass or fail, so the failures were
readable, not just countable.

The general model hadn't mangled the JSON. It hadn't missed lines, invented fields, or drifted
from the schema. Across all three trials it had produced valid, well-formed, correctly structured
output, and put the log-level word inside the message field:

```
"message": "ERROR Failed to connect to cache: timeout after 5s"
```

The coding model had stripped it. The expected answer stripped it. So the checker failed the
general model, correctly, against a specification the prompt never actually stated.

The prompt said to extract each ERROR line into `{timestamp, service, message}`. It never said
whether the word "ERROR" belongs in the message. One model read it one way, the other read it the
other way, and both readings are defensible: the line begins with the level, and whether that
level is part of the message or metadata about it is a genuine ambiguity, not a comprehension
failure.

Reword the prompt, adding one clause: "the message field must contain ONLY the text after the
ERROR level word, not the word ERROR itself." Rerun all thirty.

<figure class="fig">
  <div class="trials">
    <div class="trial-h"></div>
    <div class="trial-h">qwen3-coder-30b</div>
    <div class="trial-h">qwen3:8b</div>
    <div class="trial-r">JSON repair</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">YAML frontmatter</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">CSV cleanup</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">Docker log extraction</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
    <div class="trial-r">markdown tables</div>
    <div class="trial yes">pass</div>
    <div class="trial yes">pass</div>
  </div>
  <figcaption class="fig-cap">The same grid, once the prompt said which part of the line the message excludes. The one cell that failed is the only one that changed.</figcaption>
</figure>

The gap didn't shrink. It vanished.

</section>

<section>

## <span class="h2-num">the confirming run</span>The uncomfortable part

<p class="pull">The result that ended up under scrutiny was the one that confirmed the
hypothesis.</p>

That's backwards from how it usually goes. A disconfirming result gets picked apart, because it's
annoying and someone wants it to be a bug. A confirming result gets written up, because it agrees
with what you already believed and there's nothing left to explain.

Here, the confirming result was the buggy one. The rigour that caught it wasn't scepticism about
the article. Its claim was taken seriously enough to test properly. It was a checklist habit: read
the raw output behind a pass rate before reporting it, regardless of which way the result points.
Without that habit, the write-up would have been "tested it, and the article is right," with a
clean table underneath and no reason for anyone to look again.

The null result is also weaker than it sounds, worth stating plainly. It doesn't show the
article is wrong. The article's actual comparison was a 3B coding model against a much larger
general one, a full generation apart and roughly three times the size difference. Both models
tested here are modern and well above the size where basic structure-following stops being in
question. The claim may be entirely real at the article's scale and simply invisible at this one.
That wasn't tested, because the relevant general model doesn't fit this box's memory budget. So
the finding is narrow: on these two models, on these five task types, with unambiguous
instructions, there's no difference. Nothing about standing practice changed.

</section>

<section>

## <span class="h2-num">overwritten in place</span>One more thing that did not survive

Preparing this write-up meant going back to the raw output file. The committed file holds thirty
results, all passing. The run that produced the twelve-out-of-fifteen split, the one this entire
piece is about, no longer exists: the corrected fixtures were rerun into the same output path and
overwrote it.

The specific output quoted above survives because it was copied into the results log the same
day, by the session that had it on screen. That's a good contemporaneous record. It isn't the
artefact.

Worth noticing which run it was. What didn't survive was the disconfirming evidence: the thing
that was wrong, the run that failed, the state before the correction. Nobody deleted
anything on purpose. The rerun simply wrote to the same filename, because the interesting output
was assumed to be the final one.

The final output is the one you'll never need. It's the one that agrees with the conclusion you
already wrote down. The run worth keeping is the one that made you look twice.

</section>
