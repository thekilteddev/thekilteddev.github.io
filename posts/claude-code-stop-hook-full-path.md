---
layout: post.njk
title: A Claude Code Stop hook that makes Claude show the full file path
kicker: Field notes / Claude Code hooks
standfirst: >-
  Claude kept naming files by relative path, and a rule in CLAUDE.md did not stop it. A Stop hook did.
  The code runs on Windows and Linux, and it failed three ways before it worked.
description: >-
  A Claude Code Stop hook in 89 lines of Python that blocks any reply naming a file by a relative path
  and makes Claude answer again with the absolute path. The code, the settings.json entry for Windows
  and Linux, and three mistakes: a byte order mark, systemMessage and brace shorthand.
date: 2026-10-07
bylineTags: ["claude code", "hooks"]
permalink: /claude-code-stop-hook-full-path/
---
<!-- figure-budget-exempt: code-heavy field note: 10 code blocks, 2 tables and 1 figure carry it; no further sourced data to draw -->

Claude Code answered `Run the tests with scripts\check.py.` I needed `C:\proj\scripts\check.py`. (I staged that exchange: I asked for the short form so the hook had something to catch.)

A single path is easy to work out. A list is harder. In the folder for one video episode, Claude listed six files by short name and I could not tell where any of them were.

I had already put a line in `CLAUDE.md`, the file where you write standing instructions for Claude:

```text
Always give absolute paths, never relative ones.
```

Claude kept slipping. So I wrote a Stop hook that checks every reply and sends it back when it names a file by a relative path. The code is in the repo [claude-code-stop-hook-full-path](https://github.com/thekilteddev/claude-code-stop-hook-full-path), and the video is linked at the end. It runs on Windows and Linux. I have not tried it on macOS.

## What it does

On Windows, Claude answers `Run the tests with scripts\check.py.` The hook blocks the reply, and Claude answers again: `Run the tests with C:\proj\scripts\check.py.` That was Claude Code 2.1.284 on Haiku 4.5, in a project at `C:\proj`. The Windows part of the video uses my own hook. The one in the repo is a shorter stand-in with a different message, and it does the same job.

On Linux, the stand-in hook ran in a `node:22-slim` container with Claude Code 2.1.286 and a project at `/home/dev/proj`. Claude listed six files by short path. The hook replied `Full paths only. Your reply has short paths:` and Claude answered again with the full paths:

```text
episode/script.md     ->  /home/dev/proj/episode/script.md
episode/clip-01.mp4   ->  /home/dev/proj/episode/clip-01.mp4
episode/captions.srt  ->  /home/dev/proj/episode/captions.srt
episode/clip-02.mp4   ->  /home/dev/proj/episode/clip-02.mp4
episode/notes.md      ->  /home/dev/proj/episode/notes.md
episode/cover.png     ->  /home/dev/proj/episode/cover.png
```


## What a Stop hook receives and what it can send back

A Stop hook is a command Claude Code runs each time Claude finishes a reply. It gets one JSON object on stdin. Two of its fields matter here. `last_assistant_message` is the text of the final reply. `stop_hook_active` is `true` when Claude Code is already continuing because of a stop hook.

The hook answers on stdout. Printing `{"decision": "block", "reason": "..."}` keeps Claude from stopping, and `reason` tells it why it should continue. Printing nothing lets the reply stand. The [hooks reference](https://code.claude.com/docs/en/hooks) lists exit code 2 with the message on stderr as another way to block. This hook uses the JSON form.

Claude Code allows eight stop-hook continuations in a row before it overrides the next block and ends the turn. The hook checks `stop_hook_active` anyway: if the rewrite still has a short path, it lets the reply through instead of blocking again.

## The hook

This is the repo's stand-in hook, the one that ran in the Linux container. It is 89 lines of Python with no dependencies.

```python
#!/usr/bin/env python3
"""Claude Code Stop hook: when the last reply names a file by a short path, block it and ask for the full path.

Written for Windows, macOS and Linux; tested on Windows and Linux. Reads the Stop-hook JSON payload on stdin and prints
{"decision": "block", "reason": ...} when a reply has a short path, nothing otherwise.
Only paths inside backticks that end in a file extension are checked. A directory without an
extension, or a path outside backticks, is not flagged.
Run `python stop_hook_full_path.py --selftest` to check the cases below.
"""
import json
import re
import sys

TICKS = re.compile(r"`([^`\n]{1,200})`")
# absolute on Windows (C:\ or C:/), POSIX or UNC (leading / or \), home (~), or a URL
ABSOLUTE = re.compile(r"^(?:[A-Za-z]:[\\/]|[\\/]|~|[a-zA-Z][a-zA-Z0-9+.\-]*://)")
SEGMENT = re.compile(r"^[\w.\-{}, ]+$")  # braces and commas allowed: src/{a,b}.ts is one short path
EXTENSION = re.compile(r"\.[A-Za-z0-9]{1,6}$")


def short_paths(text):
    found = []
    for token in TICKS.findall(text):
        token = token.strip()
        if ABSOLUTE.match(token) or not re.search(r"[\\/]", token) or not EXTENSION.search(token):
            continue
        parts = [p for p in re.split(r"[\\/]", token) if p]
        if len(parts) >= 2 and all(SEGMENT.match(p) for p in parts):
            found.append(token)
    return found


def decision(payload):
    if payload.get("stop_hook_active"):
        return None  # already blocked once: let Claude stop rather than loop
    bad = short_paths(payload.get("last_assistant_message") or "")
    if not bad:
        return None
    shown = ", ".join(f"`{p}`" for p in bad[:2]) + (f" (+{len(bad) - 2} more)" if len(bad) > 2 else "")
    return {"decision": "block",
            "reason": f"Full paths only. Your reply has short paths: {shown}. Rewrite them as absolute paths."}


def load(raw):
    # Strip EVERY leading byte order mark: a UTF-8 pipe from Windows PowerShell can send two,
    # and the "utf-8-sig" codec removes only one.
    return json.loads(raw.decode("utf-8").lstrip("\ufeff"))


def selftest():
    cases = [
        ("`episode/clip-01.mp4`", True),
        ("`/home/dev/proj/episode/clip-01.mp4`", False),
        ("`/Users/dev/proj/episode/clip-01.mp4`", False),
        ("`C:\\proj\\episode\\clip-01.mp4`", False),
        ("`episode\\clip-01.mp4`", True),
        ("`src/{a,b}.ts`", True),
        ("Press `q`, then open `src/a.ts` and `src/b.ts`.", True),  # a one-character code span must not break the pairing
        ("`./src/app.ts`", True),
        ("`~/proj/app.ts`", False),
        ("`clip-01.mp4`", False),
        ("`anthropics/claude-code`", False),
        ("no backticks: episode/clip-01.mp4", False),
    ]
    for text, want in cases:
        got = bool(short_paths(text))
        assert got == want, (text, got, want)
    body = b'{"last_assistant_message": "`episode/a.md`"}'
    for prefix in (b"", b"\xef\xbb\xbf", b"\xef\xbb\xbf\xef\xbb\xbf"):  # none, one BOM, two BOMs
        assert decision(load(prefix + body)), prefix
    assert decision({"stop_hook_active": True, "last_assistant_message": "`a/b.ts`"}) is None
    six = " ".join(f"`episode/f{i}.md`" for i in range(6))
    assert "(+4 more)" in decision({"last_assistant_message": six})["reason"]
    print("all self-tests passed")


def main():
    if "--selftest" in sys.argv:
        return selftest()
    try:
        out = decision(load(sys.stdin.buffer.read()))
    except json.JSONDecodeError:
        return
    if out:
        print(json.dumps(out))


if __name__ == "__main__":
    main()
```

It flags a path only when it sits inside backticks, contains a `/` or a `\`, and ends in a file extension. Anything already absolute is skipped: `C:\` or `C:/`, a leading `/` or `\`, `~`, or a URL. These are the self-test's own cases:

| Reply contains | Result |
|---|---|
| `episode/clip-01.mp4` | flagged |
| `episode\clip-01.mp4` | flagged |
| `./src/app.ts` | flagged |
| `src/{a,b}.ts` | flagged |
| `/home/dev/proj/episode/clip-01.mp4` | left alone: absolute |
| `C:\proj\episode\clip-01.mp4` | left alone: absolute |
| `~/proj/app.ts` | left alone: absolute (home) |
| `clip-01.mp4` | left alone: a bare file name |
| `anthropics/claude-code` | left alone: missing extension |
| episode/clip-01.mp4 without backticks | left alone: outside backticks |

The message is built in `decision()`. It names the first two short paths and counts the rest as `(+N more)`.

`python stop_hook_full_path.py --selftest` runs the built-in cases and prints `all self-tests passed`.

## Adding it to Claude Code

Hooks go in a Claude Code settings file. Which one depends on how far the hook should reach:

| File | Applies to |
|---|---|
| `~/.claude/settings.json` | every project on your machine |
| `.claude/settings.local.json` | one project, and is meant to stay out of git |
| `.claude/settings.json` | everyone who uses the repository, so use it only if the script is in the repository too |

If the file already has a `hooks` object, merge the `Stop` entry into it. On Windows:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python \"C:/Users/you/hooks/stop_hook_full_path.py\"",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

On Linux:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 /home/you/hooks/stop_hook_full_path.py",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

Both paths are examples. Use the absolute path to wherever you saved the file, and make sure `python` (or `python3`) is on the `PATH` of the shell Claude Code runs it in. On Windows that is Git Bash, or PowerShell if Git Bash is not installed. `timeout` is in seconds. Type `/hooks` in Claude Code to see the hook listed. The hooks reference says edits to settings files are normally picked up automatically.

## Mistake 1: a byte order mark made the hook exit without an error

The check at that point was a short script. It already used `decision` and `reason`, because the field mistake below came first:

```python
import json, re, sys

raw = sys.stdin.read()
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)

msg = data["last_assistant_message"]
bad = re.findall(r"`((?![A-Za-z]:)[\w.-]+\\[^`]+)`", msg)
if bad:
    print(json.dumps({"decision": "block",
                      "reason": f"Use absolute paths, not: {bad[0]}"}))
```

Fed the same payload from two shells, it behaved two ways in the video. In Bash, `python check_rules_v1.py < payload.json` printed the block decision. In Windows PowerShell 5.1, `Get-Content payload.json | python check_rules_v1.py` printed nothing and reported no error. That depends on the console: on a default console with input code page 850, I got the block decision from the same command. The two settings that decide it are below. `check_rules_v1.py`, `peek.py` (used below) and `payload.json`, the sample hook input, are in the repo's `demo-bom` folder.

The cause is in the first bytes Python reads. A byte order mark is the three bytes `EF BB BF` that some tools put at the very start of UTF-8 text, and `json.loads` raises on one. When PowerShell pipes `payload.json` to Python it can add one. My `except Exception: sys.exit(0)` swallowed the error, so the hook exited quietly and blocked nothing. That looks the same as a hook with nothing to flag.

The fix reads bytes, decodes them as UTF-8, and strips every leading mark before parsing. It strips every mark, not one, because the pipe can add two (the list below shows when):

```python
raw = sys.stdin.buffer.read().decode("utf-8").lstrip("\ufeff")
```

Two settings decide how many marks Python receives. `$OutputEncoding` is the encoding PowerShell uses when it pipes data into a program. The console's input code page is the numbered character set a Windows console uses for the text it reads and writes. A second script, `peek.py`, prints the first bytes Python receives as hex, and `7B 22` is `{"`, the start of the file. With both settings on UTF-8, Python received `EF BB BF EF BB BF 7B 22 68`: two marks, and the check printed nothing.

<style>
  /* Scoped to this post (first use of the byte-strip device; promote to base.njk on a second piece).
     The viewBox is 342 wide so the 11-12px figure type stays ~1:1 on a 354px phone column;
     the cap keeps it from scaling past ~1.3x in the 672px desktop column. */
  .bom-fig { max-width: 460px; }
  .bom-cap { max-width: 460px; }
</style>
<figure class="fig">
<svg class="bom-fig" viewBox="0 0 342 284" role="img" aria-label="The first nine bytes Python received from Get-Content payload.json piped to peek.py, for each pair of console input code page and $OutputEncoding. Code page 850 with the default encoding: 7B 22 68 6F 6F 6B 5F 65 76, no byte order mark, and check_rules_v1.py blocks. 850 with UTF-8: a three-byte mark EF BB BF, then 7B 22 68 6F 6F 6B, and the check is silent. 65001 with the default encoding: the same one mark, and the check is silent. 65001 with UTF-8: two marks, EF BB BF EF BB BF, then 7B 22 68, and the check is silent.">
<text x="0" y="12" font-family="var(--font-mono)" font-size="11" letter-spacing="0.05em" fill="var(--ink-dim)">FIRST 9 BYTES PYTHON RECEIVES</text>
<line x1="0" y1="22" x2="342" y2="22" stroke="var(--rule)" stroke-width="1"></line>
<text x="0" y="44" font-family="var(--font-mono)" font-size="11" fill="var(--ink)">850 / default</text>
<text x="342" y="44" font-family="var(--font-mono)" font-size="11" text-anchor="end" fill="var(--good)">v1 blocks</text>
<rect x="0" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="19" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">7B</text>
<text x="19" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">{</text>
<rect x="38" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="57" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">22</text>
<text x="57" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">&quot;</text>
<rect x="76" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="95" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">68</text>
<text x="95" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">h</text>
<rect x="114" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="133" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="133" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="152" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="171" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="171" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="190" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="209" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6B</text>
<text x="209" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">k</text>
<rect x="228" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="247" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">5F</text>
<text x="247" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">_</text>
<rect x="266" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="285" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">65</text>
<text x="285" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">e</text>
<rect x="304" y="52" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="323" y="67" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">76</text>
<text x="323" y="87" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">v</text>
<text x="0" y="108" font-family="var(--font-mono)" font-size="11" fill="var(--ink)">850 / UTF-8</text>
<text x="342" y="108" font-family="var(--font-mono)" font-size="11" text-anchor="end" fill="var(--bad)">v1 silent</text>
<rect x="0" y="116" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="19" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">EF</text>
<rect x="38" y="116" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="57" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BB</text>
<rect x="76" y="116" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="95" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BF</text>
<rect x="114" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="133" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">7B</text>
<text x="133" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">{</text>
<rect x="152" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="171" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">22</text>
<text x="171" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">&quot;</text>
<rect x="190" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="209" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">68</text>
<text x="209" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">h</text>
<rect x="228" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="247" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="247" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="266" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="285" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="285" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="304" y="116" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="323" y="131" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6B</text>
<text x="323" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">k</text>
<text x="57" y="151" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BOM</text>
<text x="0" y="172" font-family="var(--font-mono)" font-size="11" fill="var(--ink)">65001 / default</text>
<text x="342" y="172" font-family="var(--font-mono)" font-size="11" text-anchor="end" fill="var(--bad)">v1 silent</text>
<rect x="0" y="180" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="19" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">EF</text>
<rect x="38" y="180" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="57" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BB</text>
<rect x="76" y="180" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="95" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BF</text>
<rect x="114" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="133" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">7B</text>
<text x="133" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">{</text>
<rect x="152" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="171" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">22</text>
<text x="171" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">&quot;</text>
<rect x="190" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="209" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">68</text>
<text x="209" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">h</text>
<rect x="228" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="247" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="247" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="266" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="285" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6F</text>
<text x="285" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">o</text>
<rect x="304" y="180" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="323" y="195" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">6B</text>
<text x="323" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">k</text>
<text x="57" y="215" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BOM</text>
<text x="0" y="236" font-family="var(--font-mono)" font-size="11" fill="var(--ink)">65001 / UTF-8</text>
<text x="342" y="236" font-family="var(--font-mono)" font-size="11" text-anchor="end" fill="var(--bad)">v1 silent</text>
<rect x="0" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="19" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">EF</text>
<rect x="38" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="57" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BB</text>
<rect x="76" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="95" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BF</text>
<rect x="114" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="133" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">EF</text>
<rect x="152" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="171" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BB</text>
<rect x="190" y="244" width="38" height="22" fill="none" stroke="var(--bad)" stroke-width="1"></rect>
<text x="209" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BF</text>
<rect x="228" y="244" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="247" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">7B</text>
<text x="247" y="279" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">{</text>
<rect x="266" y="244" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="285" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">22</text>
<text x="285" y="279" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">&quot;</text>
<rect x="304" y="244" width="38" height="22" fill="none" stroke="var(--rule)" stroke-width="1"></rect>
<text x="323" y="259" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink)">68</text>
<text x="323" y="279" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--ink-dim)">h</text>
<text x="57" y="279" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BOM</text>
<text x="171" y="279" font-family="var(--font-mono)" font-size="12" text-anchor="middle" fill="var(--bad)">BOM</text>
</svg>
<figcaption class="fig-cap bom-cap">The first nine bytes Python read from Get-Content payload.json | python peek.py, for each pair of console input code page and $OutputEncoding. The red bytes EF BB BF are a UTF-8 byte order mark. Below each byte, the character it stands for.</figcaption>
</figure>

I measured this in non-interactive `powershell.exe -NoProfile -File` runs on Windows PowerShell 5.1, setting `[Console]::InputEncoding` inside the script. I did not test PowerShell 7. Run `peek.py` against your own pipe before you trust a hook there.

I tested this by feeding the hook from PowerShell myself. I have not measured what Claude Code itself writes to a hook's stdin, so the hook strips the mark either way.

Reading text with `sys.stdin.read()` is not enough on Windows. `PYTHONIOENCODING` is an environment variable that overrides the encoding Python uses for stdin and stdout. When it is not set, Python 3.11 decodes a pipe with the system code page (cp1252 on my machine), and there the mark arrives as three other characters, so `lstrip` finds nothing. Setting `PYTHONUTF8=1`, Python's UTF-8 mode, changes that as well.

I had that wrong at first. The demo's first fix used `sys.stdin.read()`. It passed in a session where `PYTHONIOENCODING` was set to UTF-8 and failed in a clean one. The repo hook reads bytes the same way, but its first copy used Python's `utf-8-sig` codec, which removes one mark, so the two-mark case still failed the same silent way. The self-test now sends none, one and two.

## Mistake 2: the field name

Before that, my very first version printed `systemMessage`:

```text
{"systemMessage": "Use absolute paths, not: scripts\\check.py"}
```

The hooks reference describes `systemMessage` as a warning message shown to the user. Claude did not react to it, so nothing changed. The change that worked was two lines:

```diff
-    print(json.dumps({"systemMessage":
-                      f"Use absolute paths, not: {bad[0]}"}))
+    print(json.dumps({"decision": "block",
+                      "reason": f"Use absolute paths, not: {bad[0]}"}))
```

I did not keep that first version. The diff is a reconstruction of it, made for the video.

## Mistake 3: a check that rejected braces

One reply used brace shorthand: `social\clip-0{1,2}-9x16.mp4` means `social\clip-01-9x16.mp4` and `social\clip-02-9x16.mp4` in one name. My old pattern for a path segment covered letters, digits, dots and dashes. I did not keep it, so this one-line check does the same job, and a brace matches none of it:

```text
python -c "import re; print(re.match(r'^[\w.\-]+$', 'clip-0{1,2}-9x16.mp4'))"
None
```

The name failed the pattern, so the check ignored the reply. The pattern in the repo's hook allows braces and commas, `^[\w.\-{}, ]+$`, and the self-test includes `src/{a,b}.ts`. In my own hook, `looks_like_relative_path` returned `True` for the same name after the change.

## Where it stops

It reads the last reply only. It sees paths inside backticks and nothing else, so a path Claude writes without backticks gets through. A path with a line number, `src/app.ts:12`, is not flagged. A code span such as `python/3.11` is flagged although it is not a path. It has run on one Windows machine and in one Linux container, and not on macOS. The byte order mark behaviour above is what I measured on that one machine.

## The code and the video

The hook, its self-test, both byte order mark scripts and the Linux demo are in [claude-code-stop-hook-full-path](https://github.com/thekilteddev/claude-code-stop-hook-full-path), under the MIT licence. The video walks through the same hook: <https://youtu.be/LD_rZm5MwWs>.

This is an independent project, not affiliated with or endorsed by Anthropic.
