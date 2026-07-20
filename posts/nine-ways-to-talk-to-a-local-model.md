---
layout: post.njk
title: Nine ways to talk to a local model
kicker: Field notes / local models
standfirst: >-
  Nine pieces of software for talking to a local model, same GPU, largely the same models, one
  afternoon each. The spread in outcomes was enormous, and almost none of it was about the model.
description: >-
  A nine-tool survey of local-model interfaces on one GPU: what worked, what silently failed, and
  why what sits between you and the model matters more than which model you picked.
date: 2026-08-08
bylineTags: ["local models", "tool survey"]
permalink: /nine-ways-to-talk-to-a-local-model/
---

<section class="lead">
<p>Nine pieces of software for talking to a local model went through this machine over about two
weeks. Same GPU, largely the same handful of models, one afternoon each.</p>
<p>The spread in outcomes was enormous, and almost none of it was about the model. The same
weights that scored full marks through one harness produced unparseable garbage through another,
and hung indefinitely through a third. What sits between you and the model turns out to matter
more than which model you picked, which is a boring conclusion until you notice it also means
most model comparisons are measuring something else.</p>
<p>Here is what each one was actually good at.</p>
</section>

<section>

| Tool | Good at | The number that mattered |
|---|---|---|
| <span class="entity">Ollama</span> | the default, broadly reliable | 32.9 t/s gen on a 30B MoE |
| <span class="entity">llama.cpp</span> | fastest, once tuned | 27.1 t/s vs Ollama's 23.4 |
| <span class="entity">LM Studio</span> | document extraction to file | 10 rows, exact match, no invented values |
| <span class="entity">little-coder</span> | small-model coding harness | 8/8 in 2.1 min, then a version bump broke it |
| <span class="entity">Unsloth Studio</span> | fastest single-file result | unusable past a 4096-token ceiling |
| <span class="entity">Goose</span> | agent framework, right idea | 30% GPU vs 98%, one setting |
| <span class="entity">Claude Code</span> as client | n/a | all three connection methods fail |
| <span class="entity">Odysseus</span> | the most polished interface | 0/8, only one of three files actually saved |
| <span class="entity">Continue.dev</span> | autocomplete, nothing else does it | 355MB free at 32K, no room for anything else |

</section>

<section>

## <span class="h2-num">32.9 t/s gen, 443 t/s prefill, 69/31 split</span>Ollama, the one everything else is measured against

The default answer, and it stayed the default. It runs a 30B mixture-of-experts model at 32.9
tokens/sec generation and 443 tokens/sec prefill on a 69/31 CPU/GPU split, which is the single
most useful capability on this box.

Two things about it are worth knowing before you trust it. Its desktop application stores a
context-length setting in a local database that **overrides the environment variable** you set,
which produced a memorable afternoon of a model ignoring configuration that was demonstrably
correct. And model aliases pin their own context, which is how a working alias silently acquired
a context it had never been tested at and started failing weeks later.

Neither is a defect exactly. Both are the kind of thing you only learn by being caught by them.

<p class="section-source">↳ <a href="https://ollama.com">ollama.com</a></p>

</section>

<section>

## <span class="h2-num">27.1 vs 23.4 t/s, tuning found the other 16%</span>llama.cpp, faster if you're willing to tune it

For one specific job, a 36B mixture-of-experts model at 32K context, <span class="entity">
llama.cpp</span> beats <span class="entity">Ollama</span> by about 16% on generation and 34% on
prefill. 27.1 tokens/sec against 23.4.

That margin isn't free. It came from three separate tuning discoveries: disabling memory-mapped
file loading, which <span class="entity">llama.cpp</span> itself warns is slow when combined with
CPU tensor overrides and which alone accounted for most of the gap; setting thread count to the
CPU's fourteen physical cores rather than the eight the script had; and tuning how many expert
layers stay on the GPU.

Untuned, the same path runs at 13 tokens/sec, less than half. The default configuration of the
faster runtime is slower than the alternative, which is worth remembering whenever a benchmark
reports that one tool beats another.

<span class="entity">llama.cpp</span>'s server also has the most complete tool-calling story of
anything tested here. Given a toy arithmetic tool, it emitted five valid parseable calls out of
five. Given three near-identical tools and six questions, it selected correctly six times out of
six. That second number is the one that matters, because choosing between similar tools is where
tool-calling usually breaks.

It also has server-side built-in tools, off by default, with the server itself warning against
exposing them to untrusted environments (the available set includes shell execution). Only the
read-only subset was enabled here. Notably, the server does not auto-execute anything: it returns
the tool call and the client drives the loop. That's the right design, and it means the safety
boundary sits where you can see it.

<p class="section-source">↳ <a href="https://github.com/ggml-org/llama.cpp">github.com/ggml-org/llama.cpp</a></p>

</section>

<section>

## <span class="h2-num">10 rows, zero invented values</span>LM Studio, the graphical one, and the absolute-path rule

Good at exactly one thing this project needed: read some documents, extract structured data,
write the result to a file. Given real utility bills it produced ten rows across two months with
every usage quantity and cost matching the source exactly. No invented values.

Getting there took three attempts. The first two failed with filesystem permission errors even
after access was explicitly approved through its own dialog. The difference was the prompt: "the
files in your workspace" failed, and naming the absolute directory worked.

Whether the model requested bad relative paths or the permission scope failed to resolve them was
never determined. The rule is empirical and it's reliable: give it absolute paths.

<p class="section-source">↳ <a href="https://lmstudio.ai">lmstudio.ai</a></p>

</section>

<section>

## <span class="h2-num">8/8 in 2.1 minutes, then a version bump broke it</span>little-coder, the one that proved the whole thing was possible

A thin harness tuned for small models, giving them real file-writing tools rather than asking them
to print code into a chat window. It's what scored 8 out of 8 on this project's benchmark in 2.1
minutes, including the follow-up-fix-without-regression test that had defeated everything before
it.

Then a version bump broke it. With its default model it began emitting raw XML that nothing
parsed, exiting successfully, and writing no files, the worst failure shape available, because an
exit code of zero and no error output reads as success to anything automated.

The instructive part is the diagnosis, which was wrong the first time. The failure was recorded as
being caused by the version change breaking model-id resolution, because a warning about the model
id appeared next to the failure. A later controlled test held the model constant and varied only
id registration: the warning is benign, and the actual fault is the specific model. The same
harness works with a different one.

Adjacency isn't causation, and a warning that appears next to a failure is still just a warning
that appears next to a failure.

<p class="section-source">↳ <a href="https://github.com/itayinbarr/little-coder">github.com/itayinbarr/little-coder</a></p>

</section>

<section>

## <span class="h2-num">10 seconds, then a 4096-token ceiling</span>Unsloth Studio, fastest and unusable

The fastest single-file result of anything tested: ten seconds.

Its context window control is broken on Windows. The effective ceiling is 4096 tokens regardless
of what the interface is set to, which makes multi-file work impossible and makes any measurement
taken through it incomparable to anything else. A tool that silently runs at a fraction of the
context you configured is worse than one that refuses, because the number it shows you is a number
you will use.

It also gets flagged as malware by the antivirus on this machine, which is a false positive, and
which is its own small saga.

<p class="section-source">↳ <a href="https://unsloth.ai">unsloth.ai</a></p>

</section>

<section>

## <span class="h2-num">30% GPU vs 98% GPU, one setting</span>Goose, right idea, wrong backend

<span class="entity">Goose</span> works here, with one hard rule: use its
<span class="entity">Ollama</span> provider, never its built-in
<span class="entity">llama.cpp</span>.

The built-in path manages roughly 30% GPU and 25% CPU utilisation on Windows, a broken offload
that leaves the hardware idle while the model crawls. Through the
<span class="entity">Ollama</span> provider the same machine runs at 98% GPU.

<p class="pull">Same tool, same model, same box. One configuration choice, and the difference is
the entire value of having a GPU.</p>

<p class="section-source">↳ <a href="https://github.com/block/goose">github.com/block/goose</a></p>

</section>

<section>

## <span class="h2-num">three connection methods, one root cause</span>Claude Code itself, three methods, one root cause

The obvious idea, and the one people ask about most: point the agentic coding tool you already use
at a local model, and stop paying for tokens.

Three connection methods were tested. Setting the API base URL directly, which produces no output
without also setting an auth token to a dummy value. A proxy shim, which worked and ran at roughly
two and a half minutes per response on CPU offload. And the runtime's own native launch command,
which produced a model hallucinating unrelated tasks and emitting raw tool-call syntax as text.

All three fail, and they fail for the same reason: **local models do not parse
<span class="entity">Claude Code</span>'s system prompt format.** That's not a configuration
problem, and no amount of trying a fourth connection method changes it. The finding was worth
writing down precisely so nobody here burns another afternoon on connection method five.

<p class="section-source">↳ <a href="https://claude.com/product/claude-code">claude.com/product/claude-code</a></p>

</section>

<section>

## <span class="h2-num">82,000 stars, zero out of eight</span>Odysseus, the most polished tool tested

The most polished thing tested, and the worst result.

It scored 0 out of 8 on the same benchmark. The run climbed from 0.74 to 10.19 tokens/sec, then
stalled dead at "4% complete" with a byte-identical transcript across a five-minute recheck.
Underneath, the backend had dropped the generation stream and was returning 404 to the frontend's
status polls, which the frontend kept making, forever, with no error surfaced, no retry, and no
timeout. A silent, indefinite hang.

Two things compounded it. Its interface exposes no control for disabling thinking mode, which this
project has needed since day one, so the model visibly re-planned and restarted its own draft
mid-stream. And checking its own document panel rather than trusting the chat transcript revealed
that **only one of three files had actually been saved.** The transcript showed content that was
never written anywhere.

<p class="pull">A chat transcript is a record of what a model said, not what a system did, and
those two things diverge silently.</p>

It's also structurally unable to do what this project needs: its tools are a fixed set of
built-in capabilities toggled per message, not a registry you can register an arbitrary function
with. There was no way to run the tool-calling probe at all. Not a bug, a different product.

<p class="section-source">↳ <a href="https://github.com/odysseus-dev/odysseus">github.com/odysseus-dev/odysseus</a></p>

</section>

<section>

## <span class="h2-num">355MB free at 32K, no room for anything else</span>Continue.dev, the one that does something nothing else does

An editor extension, evaluated for autocomplete rather than chat, because autocomplete is the one
capability nothing else here provides.

A 4B model completes a fill-in-the-middle hole in 209 to 252 milliseconds at 127 tokens/sec,
comfortably inside the budget where ghost text feels helpful rather than laggy. A 9B does it in
around 328 milliseconds. A 14B coder model, the one nominally built for this, takes 2.5 seconds,
because it spills to CPU, and rambles past the hole into inventing further functions.

The measurement that mattered was not speed, though. With the autocomplete model warm at 32K
context, free video memory drops to about 355MB for the 9B and 1GB for the 4B. **There is no room
for anything else.** You can have interactive coding with autocomplete, or a background delegation
run. Not both.

<p class="section-source">↳ <a href="https://continue.dev">continue.dev</a></p>

</section>

<section>

## <span class="h2-num">five entrants, closed unrun</span>The comparison we never ran

All of this was supposed to be settled by a formal benchmark. It was written into the handover
document that started this project, as open item one: the word search task run across five
entrants, <span class="entity">Goose</span>'s built-in backend, <span class="entity">Goose</span>
via <span class="entity">Ollama</span>, <span class="entity">llama.cpp</span>,
<span class="entity">Unsloth Studio</span> and <span class="entity">LM Studio</span>, against one
baseline model, with context standardised at 89K on every runtime so the results would be
comparable.

The plan even predicted its own casualty:

<blockquote><p><span class="entity">Unsloth</span> will fail this, document it.</p></blockquote>

<p class="pull">It was closed without ever being run.</p>

Not from lack of time. By the time it came up for scheduling, its actual question, which runtime
for which job, had already been answered by using them. <span class="entity">Ollama</span> for the
coding harness. <span class="entity">llama.cpp</span> for the 36B at 32K.
<span class="entity">LM Studio</span> for graphical document extraction.
<span class="entity">Goose</span> only via <span class="entity">Ollama</span>.
<span class="entity">Unsloth</span> ruled out on the context ceiling. The proxy shim never a peer
to the others, because it's a different category of thing entirely.

A generic five-way bake-off would have re-measured memory-spill behaviour already understood, at a
context size chosen to be fair rather than useful, and changed not one of those decisions. The
tools had already differentiated themselves on the only axis that mattered: what happened when
real work went through them.

One footnote, found while checking the above against the original plan rather than against our own
notes. The record written when the benchmark was closed describes it as having six entrants, and
lists a different set, merging Goose's two configurations into one, adding a runtime the plan had
not included, and adding a proxy shim the plan mentions only in its list of things already
rejected. The reasoning for closing it was sound and every per-use-case answer holds. The entrant
list was simply restated from memory rather than reread, in a note written the same week the plan
was still open.

A benchmark nobody ran is a low-stakes thing to miscount. It's the same move that makes a
miscounted one dangerous.

The rule that came out of it is narrow. Benchmark a use case, never a category. If a new runtime
appears, or a genuinely new job appears, measure *that*, and if the answer is already visible in
work you have done, the benchmark is a formality you are performing for the shape of it.

Nine tools. The differences that mattered were reliability, offload behaviour, honesty about what
was actually written to disk, and whether the thing exposed the one control the model needed. None
of that shows up in a table of tokens per second.

</section>
