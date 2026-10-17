---
layout: post.njk
title: Not the integrated GPU
kicker: Field notes / hardware
standfirst: >-
  Two USB-C sockets on my laptop look identical. A monitor plugged into either one would land on
  the integrated graphics, or so the assumption went. It landed on the discrete GPU, and the old
  dock had been holding that same monitor at 60Hz.
description: >-
  A monitor moved off an ageing USB dock onto a native USB-C port, which turned out to route to the
  discrete GPU rather than the integrated one. Plus the 100Hz mode the dock never exposed, and a
  tool that reported the wrong adapter entirely.
date: 2026-10-17
bylineTags: ["hardware", "display topology"]
permalink: /not-the-integrated-gpu/
---
<style>
  /* Attachment map — which adapter drives which display, before and after the first move. Built on
     the site's plain table rather than a new container (hairlines only, no fill, no radius), and
     scoped here rather than promoted to base because the shape is this piece's own: four displays,
     three adapters, one move. Base sets table-layout: fixed per row, so the column split has to be
     stated on every row's first cell, not just the header, or the body rows fall back to thirds
     and stop lining up with the head. */
  /* Column widths sit on <thead> now that .reftable restores real column association — they used
     to be restated on every row's first cell to work around base's per-row table-layout: fixed.
     margin, vertical-align and the th[scope="row"] reset all come from .reftable. */
  .topo thead th:first-child { width: 42%; }
  .topo .mode, .topo .note {
    display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em;
    color: var(--ink-dim); margin-top: 5px; text-transform: none;
  }
  /* The one cell that changed. Loch is doing the same job here it does in .ratio and .trials —
     figure series 1 — not an affordance; there is nothing in this table to click. */
  .topo .moved { color: var(--loch); }
  /* Tool names are symbols, so they keep their real casing. The shared .stat-name uppercases,
     which would print an API name that does not exist. */
  .tools .stat-name { text-transform: none; }
  /* ...and a real API name is longer than a stat label. The shared 140px label track is a hard
     cap, so an unbreakable 175px symbol overflows it and prints over the description text.
     Widened here only, because breaking the symbol across lines would falsify it the same way
     uppercasing would.
     Gated above the shared 560px breakpoint: this selector out-specifies base's mobile
     .stat-row stacking rule, and ungated it would hold the two columns together on a phone. */
  @media (min-width: 561px) { .tools .stat-row { grid-template-columns: minmax(0,180px) 1fr; } }
  @media (max-width: 560px) {
    .topo { font-size: 13px; }
    .topo thead th:first-child { width: 38%; }
  }
</style>

<section class="lead">

Three monitors, one laptop, and one USB dock old enough to be a bottleneck. Two of the three
monitors ran through it: a 4K panel and an ultrawide, both sharing one USB link with the keyboard,
the mouse, and Ethernet. The third monitor, a second 4K panel, was already wired natively straight
to the discrete GPU over HDMI, no dock involved. The dock was doing its job. It just had a lot of
job to do for two-thirds of the setup.

The laptop has two USB-C sockets, and the working assumption going in was that a monitor plugged
into either one would land on the integrated graphics, the way a lot of thin-and-light laptops
route USB-C video. The two ports look identical. They aren't quite: one carries power delivery up
to 100W and DisplayPort 2.1, the other tops out at DisplayPort 1.4 with no power delivery at all.
Both are wired to the same USB controller underneath, the only one this laptop has. A different
configuration of the same chassis swaps one of those ports for Thunderbolt; this one doesn't, and
I confirmed that by checking the controller list directly rather than trusting the spec sheet for
this exact model.

</section>

<section>

## <span class="h2-num">2 sockets, 1 controller</span>The port routes to the discrete GPU, not the integrated one

Moving the ultrawide monitor from the old dock onto the power-delivery USB-C port — native DisplayPort
Alt Mode, the mode that carries real DisplayPort video directly over a USB-C connector, no dock in
between — settled the assumption by measurement instead of guesswork. The
monitor came up attached to the discrete GPU. Not the integrated graphics chip doing double duty on
the internal panel and the USB-C port both, which was the original assumption. A separate, dedicated
card, the same one already driving one of the 4K monitors over HDMI.

<figure class="fig">
  <table class="reftable topo">
    <thead>
      <tr><th scope="col">Display</th><th scope="col">Was driven by</th><th scope="col">Now driven by</th></tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Internal panel<span class="mode">2560&times;1600 &middot; 165Hz</span></th>
        <td>integrated GPU</td>
        <td>integrated GPU</td>
      </tr>
      <tr>
        <th scope="row">4K panel, HDMI<span class="mode">3840&times;2160 &middot; 60Hz</span></th>
        <td>discrete GPU</td>
        <td>discrete GPU</td>
      </tr>
      <tr>
        <th scope="row">Ultrawide<span class="mode">3440&times;1440 &middot; 60Hz &rarr; 100Hz</span></th>
        <td>the dock</td>
        <td class="moved">discrete GPU</td>
      </tr>
      <tr>
        <th scope="row">4K panel, dock<span class="mode">3840&times;2160 &middot; 60Hz</span></th>
        <td>the dock</td>
        <td>the dock<span class="note">cable ordered</span></td>
      </tr>
    </tbody>
  </table>
  <figcaption class="fig-cap">Four displays across three adapters, read out of dxdiag before and after the first move. Only the ultrawide changed hands. The second 4K panel is still on the dock, waiting on a cable.</figcaption>
</figure>

The other USB-C port hasn't been tested the same way yet. The reasonable guess is that it behaves
the same, since both ports sit on the same controller, but a guess is exactly the thing this whole
exercise exists to replace with a measurement, so it stays a guess until it's checked.

</section>

<section>

## <span class="h2-num">59.97Hz &rarr; 99.90Hz</span>Faster the moment the dock was out of the path

With the ultrawide on its own native connection, `dxdiag` showed it running at 3440×1440. The old
dock connection had topped out at 60Hz for that monitor, full stop. There was no higher option to
select. The panel itself supports 100Hz; the dock's video path never exposed anything past 60,
because it wasn't sending real DisplayPort signal at all — it was compressing the whole desktop into a
video stream and shipping that over USB.

The refresh rate didn't jump to 100Hz on its own, though. Straight after the re-cable, the display
still reported 59.97Hz, because Windows carries a monitor's previous setting forward across a
different physical connection rather than picking the best one available. The `Choose a refresh
rate` dropdown listed nine options, four of them marked with an asterisk meaning the adapter
synthesised them rather than the monitor actually supporting them:

| Refresh rate | Note |
|---|---|
| 99.90 Hz | unmarked |
| 75.03 Hz | adapter-synthesised |
| 72.19 Hz | adapter-synthesised |
| 70.07 Hz | adapter-synthesised |
| 60 Hz | |
| 59.97 Hz | selected |
| 59.94 Hz | |
| 56.25 Hz | adapter-synthesised |
| 50 Hz | |

Picking the unmarked 99.90Hz by hand got a 100Hz reading in `dxdiag` afterward.

<p class="pull">A cable upgrade doesn't come with an automatic refresh-rate upgrade attached. Somebody has to go into the settings and pick it.</p>

</section>

<section>

## <span class="h2-num">right numbers, wrong adapter</span>A tool that reported the wrong monitor entirely

One check along the way turned up something worth flagging on its own, separate from the dock:
`Win32_VideoController`, a common way of asking Windows what resolution and refresh rate a graphics
adapter is currently running, gave a confidently wrong answer in this exact multi-monitor setup. It
reported the
integrated graphics chip as running the ultrawide's resolution at 60Hz. The integrated chip was
never connected to that monitor at all. It was driving the laptop's own internal screen, at a
completely different resolution and refresh rate. `dxdiag`, read directly, had the real picture:
internal panel on the integrated chip, ultrawide hanging off the old dock. The first tool wasn't
lying about a number — it was reporting the wrong adapter's numbers as if they belonged to a monitor
they'd never touched. I'd check with a second tool before trusting a report like that in any
setup with more than one screen.

<figure class="fig">
  <div class="stat-rows tools">
    <div class="stat-row">
      <div class="stat-name">Win32_VideoController</div>
      <p class="stat-desc">Integrated graphics, 3440&times;1440 at 60Hz. That is the ultrawide's mode, on an adapter that was never wired to it.</p>
    </div>
    <div class="stat-row">
      <div class="stat-name">dxdiag</div>
      <p class="stat-desc">Integrated graphics, 2560&times;1600 at 165Hz, on the laptop's own internal panel, which is what it was actually driving.</p>
    </div>
  </div>
  <figcaption class="fig-cap">The same adapter, read two ways, on the same machine on the same day. The top row is quoting a mode off a monitor that adapter never drove.</figcaption>
</figure>

</section>

<section>

## <span class="h2-num">~25 Gbps into ~4</span>The bandwidth math the dock was quietly doing

The old dock's USB link carries something like 4 gigabits a second, shared across both monitors, the
keyboard and mouse, and the network connection. A single 4K panel at 60Hz, uncompressed, needs
roughly 12.8 gigabits a second on its own. Two monitors, both routed through that one dock, meant
somewhere around 25 gigabits of raw pixel data getting squeezed into a 4-gigabit pipe, continuously,
the entire time both screens were on. Something has to give, and what gave was a real-time
compression pass running in software the whole time, on hardware never asked whether it minded.

<figure class="fig">
  <div class="ratio">
    <div class="ratio-col s1"><div class="ratio-bar" style="height: 100%"></div></div>
    <div class="ratio-col"><div class="ratio-bar" style="height: 16%"></div></div>
  </div>
  <div class="ratio-key">
    <div><b>~25 Gbps</b><span>both dock monitors, uncompressed</span></div>
    <div><b>~4 Gbps</b><span>what the dock's link carries</span></div>
  </div>
  <figcaption class="fig-cap">Drawn to scale. The right-hand bar is also carrying Ethernet, the keyboard and the mouse. Everything above it is a compression pass running in software, continuously, for as long as both screens are on.</figcaption>
</figure>

Native DisplayPort Alt Mode over USB-C, by contrast, has room to spare: the standard this laptop's
faster port supports moves tens of gigabits a second, more than enough for one monitor at its native
resolution and refresh rate with nothing left to compress. Once the ultrawide moved off the dock,
its own share of that math simply stopped being a problem.

</section>

<section>

## <span class="h2-num">1 of 2 moved</span>Where this actually stands

One monitor is done: natively connected, correctly identified as running off the discrete GPU, and
finally at the refresh rate it was always capable of. A cable for the second monitor, DisplayPort
this time rather than the general-purpose USB-C to USB-C cable currently in use, has been ordered
but not yet installed. Once it lands, the old dock drops out of the video path entirely and keeps
one job: charging and networking, which is what a general-purpose USB link is good at.

Nothing here was fixed by buying better hardware. The laptop, the monitors, and the faster port were
all already sitting there. The fix was checking which port actually did what, instead of assuming
the label on the box.

</section>
