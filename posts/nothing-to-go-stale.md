---
layout: post.njk
title: Nothing to go stale
kicker: Field notes / shared hardware
standfirst: >-
  One GPU on one machine, and a proposal to guard it with a lock file. Every careful part of that
  lock existed to defend against problems the lock itself introduced. The hardware already knew
  what was holding it, and would say so if asked.
description: >-
  A proposal to guard one shared GPU with a lock file, and why the careful parts of that lock
  existed only to manage its own side effects. A live query to the driver had no state to go stale,
  and caught the failure a lock would have missed.
date: 2026-11-07
bylineTags: ["shared hardware", "design decisions"]
permalink: /nothing-to-go-stale/
---
<section class="lead">

One GPU, one machine, and for now exactly one tool that needs it: a local model doing GPU-bound
work a couple of times a week for one project that calls it. Small enough that nothing had broken
yet. Also the moment a design decision is cheapest to get right, before real usage patterns build
up around whatever gets chosen first.

The proposal that came my way was the standard answer to "two things might want the same resource
at once": a lock file. Before using the GPU, claim it by creating a marker. Before finishing, remove
the marker. Anything that shows up while the marker exists waits its turn. It's a well-understood
pattern, and the version proposed was already a careful one: atomic creation so two claims can't
race each other, enough content in the file to tell a genuinely stale lock from a live one.

</section>

<section>

## <span class="h2-num">the lock guards itself</span>What a lock file is actually for

I looked closely at why a lock needs to be careful in the first place: it isn't protecting against
the resource being busy. It's protecting against the lock itself lying. Every piece of a well-built
lock's design — atomic creation, a check for whether the lock has gone stale, cleanup on every exit
— exists to defend against failure modes the lock introduces just by existing. A resource that was
never contended in the first place doesn't need any of that. The contention was never the hard
part. The bookkeeping was.

</section>

<section>

## <span class="h2-num">one command, no file</span>Don't keep a record, ask

The hardware itself already knows exactly what's using it, right now, with no possibility of going
stale, because it isn't a record of a past claim. It's the current state, queried live. A single
command asks the driver directly: what's running, how much memory is it holding. No file to
create, none that can outlive the process that made it, no PID to check against a process table
that might have recycled it by now.

And it fits the actual failure this machine has had: not two processes racing to grab the GPU at
the same instant, but one process hanging without dying and quietly sitting on memory the next job
needs. A lock file wouldn't catch that at all. A
hung-but-alive process holds its lock exactly as validly as a healthy one. Asking the hardware
catches it immediately, because the memory is either there or it isn't, whatever any marker file
claims.

<figure class="fig">
  <div class="burden">
    <div>
      <div class="burden-h">What a lock file has to get right</div>
      <ul class="burden-list">
        <li>Create the marker atomically, so two claims can't race</li>
        <li>Remove it again, on every path out</li>
        <li>A holder that died without removing it</li>
        <li>A process ID the operating system has already reused</li>
        <li>A holder that hangs without dying, and keeps the lock</li>
      </ul>
    </div>
    <div>
      <div class="burden-h">What a live query has to get right</div>
      <ul class="burden-list">
        <li>Nothing. There is no stored claim, so there is nothing that can disagree with the hardware.</li>
      </ul>
    </div>
  </div>
  <figcaption class="fig-cap">Four of the five are obligations the lock creates for itself. The fifth, creating the marker atomically, guards a simultaneous race, which is not the failure this machine has actually had.</figcaption>
</figure>

The one thing a lock file offers that a live query doesn't — a clean error message naming who's
holding the resource — is available from that same query. The command that shows what's running
also shows which process ID owns it.

<p class="pull">Zero staleness handling needed, because there's no state to go stale. Not a cleverer lock, no lock at all.</p>

</section>

<section>

## <span class="h2-num">same document, two answers</span>A second cut, caught by asking someone to disagree

A related piece of the same proposal suggested retry logic: if the resource is busy, wait and try
again automatically. Reasonable-sounding, and it was cut too — by an independent review pass
commissioned alongside the decision itself, brought in to look for problems rather than confirm
the plan.

An unattended process retrying its way onto shared hardware is precisely what this project's own
rule against unattended execution already exists to prevent. Elsewhere in the same document, the
proposal that suggested the retry logic had made that exact argument in a different context.
Nobody had done anything dishonest. It's an easy inconsistency to write past when you're the one
building the argument in the first place. The retry logic and the no-autonomous-execution
principle were reasoned about separately, minutes apart, and never checked against each other
until someone whose only job was to do exactly that.

<figure class="fig">
  <div class="burden">
    <div>
      <div class="burden-h">What the proposal asked for</div>
      <ul class="burden-list">
        <li>If the hardware is busy, wait and try again</li>
        <li>Automatically, unattended, with nobody watching</li>
      </ul>
    </div>
    <div>
      <div class="burden-h">What the same document ruled out</div>
      <ul class="burden-list">
        <li>Anything that can fire on its own</li>
        <li>Anything that runs with no person present to catch it</li>
      </ul>
    </div>
  </div>
  <figcaption class="fig-cap">One document, two conclusions, minutes apart. Side by side they are incompatible; read in the order they were written, neither one looks wrong.</figcaption>
</figure>

Fail fast instead. If the resource is busy, say so and stop. A human decides when to try again.

</section>

<section>

## <span class="h2-num">not simpler, more correct</span>What made the lazy answer the right one

None of this came from my distrust of locks in general, or a rule that says avoid new machinery. It
came from asking what problem the proposed fix was solving, and finding that its complexity existed
only to manage its own side effects. The resource was never the source of the risk. The simplest
version of the design didn't win by being simpler. It won because it was more correct, for the
failure that had actually happened, and had nothing left over to go wrong.

</section>
