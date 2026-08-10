---
layout: post.njk
title: What really fits in 8GB VRAM
kicker: Field notes / local models
standfirst: >-
  My laptop reports 24GB of video memory. It has 8GB of VRAM. Four separate numbers turned out to
  be measuring something adjacent to what decides whether a model loads, and not one of them was a
  bug.
description: >-
  Four VRAM numbers that looked wrong on an 8GB laptop, none of them a bug: what dxdiag actually
  reports, what the desktop holds back before a model even loads, and the two fit rules that came
  out of chasing all four down.
date: 2026-08-01
bylineTags: ["local models", "GPU memory"]
permalink: /what-really-fits-in-8gb-vram/
---

<section class="lead">
<p>Every question about running models locally reduces to one question: will it fit. Which model,
which runtime, which quantisation, whether the thing is usable or a slideshow: all of it comes
down to that one word. The trouble is that the number deciding the answer is never the number
anything shows you.</p>
<p>This is a laptop with an RTX 5060 and 8GB of VRAM. Four separate figures turned out to be
measuring something adjacent to what actually mattered. Not one of them was wrong. Each was
reporting a real quantity. Just not the quantity that decides whether a model loads.</p>
</section>

<section>

## <span class="h2-num">24,144 = 7,899 + 16,245</span>The first number: shared memory

<p class="cmd"><span class="p">&rsaquo;</span> dxdiag /whql:off /t &lt;outfile&gt;</p>

Run that on this machine, open the Display tab, and it reports the graphics card as having
**24,144 MB** of display memory. Twenty-four gigabytes, on a laptop sold as having eight. Directly
underneath, the same panel breaks it down:

```
Display Memory:    24144 MB
Dedicated Memory:   7899 MB
Shared Memory:     16245 MB
```

7,899 plus 16,245 is 24,144. The arithmetic is honest. Display memory is the dedicated VRAM on the
card plus a slice of system RAM the driver treats as overflow, half the machine's 31.7GB, the
standard Windows allocation. Only the dedicated figure decides whether a model loads.

Two details make the trap worse than a single mislabelled number. The shared pool isn't the
graphics card's at all, and every display adapter on the machine claims it: the integrated Intel
graphics, the RTX 5060, and two DisplayLink devices all report the same 16,245 MB. Add up what the
machine appears to have and the total overstates the truth several times over. The dedicated
figure isn't perfectly stable either: a model-fitting tool run on the same box reported 7.96GB
where dxdiag says 7,899 MB, close enough to be the same answer, far enough apart that a fit
calculation cutting it fine will disagree with itself depending on which tool it asked.

The two pools behave completely differently under load. VRAM is fast and finite. The shared
region is system RAM wearing a costume: spilling into it doesn't fail, it just gets slow, and a
slowdown is worse than a failure because a failure tells you something is wrong while a slowdown
just lets you keep going, wondering why everything feels off. A 9B model at 32K context sits
entirely in VRAM at 5.9GB and generates 51.5 tokens/sec. Push the context to 64K and it needs
7.5GB, spills to an 18/82 split, and drops to 22.6 tokens/sec. Same model, same machine, same
quantisation. One setting, less than half the speed.

None of this requires taking anyone's word for it: the breakdown is four lines down the Display
tab on every Windows machine there is.

</section>

<section>

## <span class="h2-num">2-3.5GB gone before a model loads</span>The second number: your desktop already has some of it

The dedicated 7.9GB isn't yours either. Under normal use (browser open, editor open, the desktop
doing its job) somewhere between 2 and 3.5GB is already spoken for before a single model loads.
Not reserved in a way you can reclaim by closing one app. Just gone, in the ordinary course of
using the computer for anything other than inference.

The spread matters as much as the figure. Measured on this machine with a browser, a notes app, a
spreadsheet and around thirty other things touching the GPU, it sits at almost exactly 2GB. On a
busier day it has been half again that. On the quiet afternoon the benchmark below was recorded,
it was under 1GB.

That shows up in the benchmark record as an awkward footnote. Here is the same 36B
mixture-of-experts model, three ways, every row measured at the same 32K context:

| Configuration | Gen t/s | VRAM | When you can use it |
|---|---|---|---|
| llama.cpp, 8 expert layers on GPU | **27.1** | 7.4GB | Apps closed only |
| llama.cpp, 6 expert layers on GPU | 26.3 | 6.4GB | Recorded safe default |
| Ollama, automatic 80/20 CPU/GPU split | 23.4 | n/a | Default behaviour |

Same day, same machine, flash attention on, KV cache quantised to q8_0. Ambient GPU load during
measurement was unusually low, between 0.3 and 0.8GB; normal desktop load is around 3.5GB.

That fastest row leaves around 800 MB of headroom, and it was measured on that unusually quiet
afternoon. Under normal desktop load it doesn't fit at all. So the best number in the table is one
that can't be reproduced while actually using the computer, and the benchmark file says so
directly rather than quoting the headline figure and moving on.

</section>

<section>

## <span class="h2-num">four numbers, two rules</span>The two rules that came out of it

After enough of this, the fit question collapsed into two rules that are worth more than any
individual measurement.

Dense models: the file has to be about 7GB or smaller at 4-bit quantisation, and it has to run
entirely on the GPU. If it spills, the speed lost is more than a bigger model would have gained.

Mixture-of-experts models: the file has to fit in system RAM (31.7GB here) with the experts
offloaded to the CPU. VRAM only needs to hold the attention layers and the key-value cache.

The second rule produces the result that governs everything this project runs: a large
mixture-of-experts model fits comfortably where a much smaller dense model doesn't. A 30B MoE
model with a 19GB file runs at 32.9 tokens/sec generation on a 69/31 CPU/GPU split, at 16K
context. A 14B dense model is simply ruled out, and so is the default pull of a well-known 9.6GB
dense model, on the dense rule alone.

That context qualifier isn't decoration. Speed figures are only comparable within a single
context size, which is why every number here carries one.

<p class="pull">Parameter count isn't the constraint. Architecture is: a model three times the
size fits because of how it's shaped.</p>

That's invisible from any spec sheet that lists parameters and file sizes. Not everything needs a
hands-on trial to rule out, either. An 80B MoE model was ruled out at the research stage: its
smallest 4-bit quantisation is 38.4GB, more than the machine has RAM for at all. No test required.

</section>

<section>

## <span class="h2-num">49 of 49 layers, and that wasn't the bug</span>The third number: the config that was right when it was written

Six weeks in, a model that had been working for over a week stopped loading. Every attempt died
with a CUDA out-of-memory error, and the first answer was wrong.

The server log said it had offloaded 49 of 49 layers to the GPU, which reads unambiguously as "it
tried to load the whole thing into VRAM instead of doing the CPU split that had been working." A
satisfying scheduler bug, except it wasn't what happened. Reading the full memory breakdown
instead of the first suspicious line showed the actual buffer allocation: 3.2 to 4GB in the GPU
buffer against 13.5 to 14.3GB in pinned host memory. The CPU offload was correct the whole time.
That log line's wording misled; it wasn't evidence.

The real cause turned up in the runtime's own fit-calculation logging, and it wasn't a bug either.
The fit calculation had correctly worked out that 43 of 49 layers would overflow to host RAM, and
projected 5,123 MiB of VRAM use against 6,196 MiB free. A plausible-looking fit.

What had actually happened was that the model's local alias had been silently recreated eight
days earlier, inheriting the project's default context setting of 32,768, and this particular
model had never been verified at that context. It had been benchmarked at 16K.

The evidence was sitting in the original benchmark file the whole time, contradicting itself. The
prose describing the working run states the context parameter as 32,768. The speed table further
down labels the identical CPU/GPU split "@16K." Both written the same day, about the same run.
Nobody reads a benchmark file for internal consistency after writing it, so the contradiction sat
there quietly. A single-variable test settled it: at 16,384 the model loads and generates every
time; at 32,768 it fails every time. The fix was re-pinning the alias: a configuration
correction, not a code change.

</section>

<section>

## <span class="h2-num">failed with 6.1GB free</span>The fourth number: free memory doesn't predict this

The most useful part of that failure is the bit that contradicts intuition. The out-of-memory
error didn't depend on how much VRAM was free. Retested with the model fully unloaded and 6.1GB
available, it still failed, ruling out the obvious explanation that some other app was
transiently holding memory. At 32K context, the model's key-value cache plus its compute buffers
exceed what fits after the CPU offload split, regardless of what's free. Headroom isn't the
variable. The shape of the allocation is.

That has a practical edge: a fit-estimating tool used on this machine calculates against total
VRAM rather than free VRAM, so its recommendations need hand-adjusting for whatever the desktop is
already holding.

| Theory | Evidence against | Verdict |
|---|---|---|
| Scheduler bug — full model loaded to GPU instead of the working CPU split | Full memory breakdown showed the correct 3.2–4GB GPU buffer against 13.5–14.3GB in pinned host memory | <span class="tag bad">Ruled out</span> |
| Some other app transiently holding VRAM | Retested with the model fully unloaded and 6.1GB free — still failed | <span class="tag bad">Ruled out</span> |
| Alias silently recreated 8 days earlier, inheriting the default 32K context the model had never been verified at | Single-variable test: loads at 16,384 every time, fails at 32,768 every time | <span class="tag good">Real cause</span> |

</section>

<section>

## <span class="h2-num">four numbers, zero bugs</span>What this adds up to

Four numbers, four different ways of being adjacent to the truth. Windows reports memory that
includes a region you don't want to touch. The desktop silently holds a few gigabytes of what
remains. A log line describes full GPU offload while performing a CPU split. A config file records
a context the model was never tested at, and a fitting tool measures against a total nobody
actually has.

None of these is a bug. Every one is a real measurement of something, presented plainly, by
software with no intention to mislead. They're wrong only in the sense that they answer a question
next to the one being asked, which is why the two fit rules are worth more than the measurements
that produced them. The rules survive a driver update, a runtime version bump, a model release.
The numbers don't, and the ones that look most authoritative are usually the ones measured on an
unusually quiet afternoon.

</section>
