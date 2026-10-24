---
layout: post.njk
title: Nineteen calls, every time
kicker: Field notes / debugging
standfirst: >-
  My Claude desktop app died five times in one day, on a Legion 5 laptop. Memory, the graphics
  driver and a leftover process all cleared. What actually killed it was in a log nobody had
  opened, repeating at exactly the same size every time.
description: >-
  Five crashes in one day, every one with the same exit code. Memory, the graphics driver and a
  stale process each cleared. The cause was a fixed nineteen-call WebGL burst in a browser-level
  log, sitting in the gap between a preview pane opening and the process dying.
date: 2026-10-24
bylineTags: ["debugging", "log forensics"]
permalink: /nineteen-calls-every-time/
---
<style>
  /* Sequence rail. Authored for this piece: nothing in the shared system carries an ordered
     chain of events, and the ORDER is the finding here (the pane opening sits upstream of the
     calls, the calls upstream of the crash). House no-container grammar, same family as .pull
     and the table: one hairline, square marks sitting on it, no fill, no radius, no box, so R4
     cannot apply. The marks are squares rather than circles, echoing the wordmark's block
     cursor and the .trial mark already in base. Below 560px three columns would leave ~110px a
     stop, so it turns into a left-ruled column instead of shrinking. */
  .seq {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 20px;
    border-top: 1px solid var(--rule); margin: 32px 0 8px;
  }
  .seq-stop { position: relative; padding: 22px 0 4px; }
  .seq-stop::before {
    content: ""; position: absolute; top: -4px; left: 0;
    width: 7px; height: 7px; background: var(--loch);
  }
  .seq-stop.is-probe::before { background: var(--moss); }
  .seq-stop.is-end::before { background: var(--bad); }
  .seq-when {
    display: block; font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-dim);
    margin-bottom: 6px;
  }
  .seq-what { display: block; font-size: 16px; line-height: 1.45; color: var(--ink); }
  @media (max-width: 560px) {
    .seq {
      grid-template-columns: 1fr; gap: 0; border-top: 0;
      border-left: 1px solid var(--rule); padding-left: 20px;
    }
    .seq-stop { padding: 14px 0; }
    .seq-stop::before { top: 22px; left: -24px; }
  }
</style>

<section class="lead">

Claude's own desktop app kept dying outright, the whole window gone, no warning. Not a hang, not a
freeze that eventually recovers: the process behind the screen simply stopped existing. It happened
five times in one day alone, on a Lenovo Legion 5 laptop. Each one logged the identical signature:
the GPU process reported gone, reason crashed, exit code 101457950, every single time.

I ruled out the obvious suspects first, one at a time, and each one cleared.

Memory looked fine going into the crash: system RAM had over ten gigabytes free at the moment
checked, nowhere near exhausted. The graphics driver never logged a reset around any crash checked
for one, no driver-level event in the system log at all. Nothing was left over from a
previous crash either: once the app went down, the only thing still running afterward was an
unrelated command-line helper, so there was no stale process holding a lock that could explain the
next crash starting from a bad state. Three clean suspects, three dead ends.

</section>

<section>

## <span class="h2-num">19 calls, five times</span>The pattern that was hiding in a different log entirely

The actual cause turned up somewhere nobody was looking directly for it: a completely separate log
file, tracking browser-level activity rather than the app's own process events. A specific WebGL
call — `getInternalformatParameter`, the kind a web page makes to ask the graphics driver about
supported texture formats — showed up in a tight burst right before every crash. Not once or twice. Every single time, across five
separately timed occurrences spanning hours, that burst was exactly the same size: nineteen calls.
Never eighteen. Never twenty. A fixed number repeating exactly, five times, is not what a random
failure looks like. It's what a fixed sequence running to completion looks like, every time it
runs at all.

The trigger was a browser preview pane inside the app, opened by whatever the user was doing at the
time, loading a page that happened to run a script probing WebGL capabilities as part of its own
fingerprinting or feature detection. Each crash landed five to six seconds after the preview pane
had opened. The nineteen-call burst sat right in that gap, every time.

<figure class="fig">
  <div class="seq">
    <div class="seq-stop">
      <span class="seq-when">start</span>
      <span class="seq-what">The browser preview pane opens.</span>
    </div>
    <div class="seq-stop is-probe">
      <span class="seq-when">in the gap</span>
      <span class="seq-what">A page inside it runs nineteen WebGL calls.</span>
    </div>
    <div class="seq-stop is-end">
      <span class="seq-when">5-6s later</span>
      <span class="seq-what">The GPU process is gone.</span>
    </div>
  </div>
  <figcaption class="fig-cap">The same three steps behind all five crashes in one day. The nineteen calls sat in the gap between the pane opening and the process dying, every time.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">one open, no burst</span>Opening the pane wasn't enough by itself

One earlier preview-pane open that same day had no burst afterward, and no crash. That's the detail
that rules out "the preview pane itself is the problem." The pane can open cleanly all day. What
kills the process is specifically a loaded page inside it running that exact probe sequence to
completion, not the act of opening the pane at all.

A separate warning line, about a GPU power-preference option being ignored on this platform, showed
up earlier that same morning with nothing bad following it: checked five seconds either side, no
burst, no crash. That same warning also appears at the very top of every one of the actual crash
sequences, immediately before the nineteen calls start. So the warning by itself isn't the trigger.
It's a harmless line that happens to sit right before the real trigger, whenever the real trigger
runs at all, which made it worth ruling out on its own rather than assuming it was just noise.

| Suspect | What the check found | Verdict |
|---|---|---|
| Memory pressure | Over ten gigabytes of system RAM still free at the moment checked | <span class="tag bad">Ruled out</span> |
| A graphics-driver reset | No driver-level event in the system log around any crash checked for one | <span class="tag bad">Ruled out</span> |
| A stale process from the last crash | Only an unrelated command-line helper still running afterward | <span class="tag bad">Ruled out</span> |
| Opening the preview pane, on its own | One open earlier the same day, no burst after it and no crash | <span class="tag bad">Ruled out</span> |
| A GPU power-preference warning | Checked five seconds either side, no burst and no crash following it | <span class="tag bad">Ruled out</span> |
| A loaded page running the probe to completion | A burst of exactly nineteen calls in the gap before every one of the five crashes | <span class="tag good">Real cause</span> |

</section>

<section>

## <span class="h2-num">six confirmed, one maybe</span>A sixth possible crash, found and deliberately left uncounted

Going back further in the logs turned up one more candidate burst, eight days before the day with
five crashes, and it doesn't get counted. Here's why. The burst is there, the right size, in the
right log. What isn't there is the matching crash line. The specific stretch of log covering that
exact window had already rotated out of every log file still on disk by the time anyone went
looking. What's on disk instead is a fresh app launch about nine minutes after the burst, with the
previous launch recorded two days earlier, meaning something ended that long-running session before
the new one started, just not on camera. A restart nine minutes after an unexplained burst, with
nothing describing how the previous session actually ended, is consistent with the same crash. It
is not proof of it. Six of the bursts line up with a confirmed crash: one five days earlier, and
all five from the day of the five crashes. The unconfirmed one from further back stays unconfirmed,
named as a maybe rather than quietly rounded into the count. If it belongs in the total,
that's a call for whoever owns the running tally next, made with the gap in the evidence attached,
not asserted on the strength of a nine-minute coincidence alone.

<figure class="fig">
<table class="ledger">
<thead>
<tr>
<th scope="col"><span class="sr">Occurrence</span></th>
<th scope="col" class="axis">19-call burst</th>
<th scope="col" class="axis">Crash on record</th>
</tr>
</thead>
<tbody>
<tr class="voice">
<th scope="row" class="name">The five in one day<span class="eng">nineteen calls each</span></th>
<td class="cell" data-axis="19-call burst"><span class="m met"></span><span class="sr">found</span></td>
<td class="cell" data-axis="Crash on record"><span class="m met"></span><span class="sr">found</span></td>
</tr>
<tr class="why"><td colspan="3">Every burst the same size, each one in the gap after the preview pane opened.</td></tr>
<tr class="voice">
<th scope="row" class="name">Five days earlier<span class="eng">nineteen calls</span></th>
<td class="cell" data-axis="19-call burst"><span class="m met"></span><span class="sr">found</span></td>
<td class="cell" data-axis="Crash on record"><span class="m met"></span><span class="sr">found</span></td>
</tr>
<tr class="why"><td colspan="3">Same signature, same size, on a day with a crash already on the record.</td></tr>
<tr class="voice">
<th scope="row" class="name">Eight days earlier<span class="eng">nineteen calls</span></th>
<td class="cell" data-axis="19-call burst"><span class="m met"></span><span class="sr">found</span></td>
<td class="cell" data-axis="Crash on record"><span class="m unrun"></span><span class="sr">could not be established</span></td>
</tr>
<tr class="why"><td colspan="3">The burst is there. The stretch of log that would carry the crash line had already rotated off disk, so it stays out of the count.</td></tr>
</tbody>
</table>
  <div class="key">
    <span><span class="m met"></span> found</span>
    <span><span class="m unrun"></span> could not be established</span>
  </div>
  <figcaption class="fig-cap">Seven bursts in the logs, six of them beside a crash on the record. The seventh is left out of the count rather than rounded into it.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">zero crash dumps</span>What's left open

No crash-diagnostic file was produced by any of the five crashes: the folder where the app would
normally leave one after a hard failure stayed empty every time. The bug is filed upstream as
<a href="https://github.com/anthropics/claude-code/issues/80444">anthropics/claude-code#80444</a>,
alongside around ten duplicate reports, reproduced across NVIDIA,
AMD, and Intel graphics on both Windows 10 and 11, so it isn't specific to this one laptop. All of
them are still open. I put a comment on that issue with this machine's own findings, and the
thread is still getting daily activity from other people hitting the same crash. In the meantime
the only mitigation that actually works is not opening that specific browser preview feature at
all, and driving anything that needs a real browser through a separate, standalone tool instead.

<p class="pull">None of this was hard to check, once the search moved from guessing at causes to
reading the log that actually recorded what happened.</p>

The memory number, the driver log, the leftover-process check: all fast, all clean, all wrong turns
that had to be ruled out anyway before the real pattern, sitting in a log nobody had thought to grep
yet, showed up in exactly the same shape five times in a row.

</section>
