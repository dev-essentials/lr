# rl
> Extract line ranges from piped input.

[![npm](https://img.shields.io/npm/v/rl-util.svg?style=for-the-badge)](https://www.npmjs.com/package/rl-util)

**INFO**: rt is still in early development. Syntax and features may be subject to change.

## Why
I frequently find myself googling 'linux get specific line from file'.

Here's what usually pops up[<sup>*1</sup>](#footnotes):
- `cat myfile | sed -n '10,20p;21q'`
- `cat myfile | awk 'NR>=10&&NR<=20'`

I'm looking this up more often than I wanna admit.   
So I wrote a simple solution for extracting line ranges.

Of course sed and awk are way more powerful, but if you just wanna extract some lines and just can't remember those commands, rl could be a good alternative for you.

## Syntax
rl has a very simple range-based syntax.   
It is parsed by the following regexp: `/(\^|\d+)?(?:-(\d+|\$))?/g`

A range is basically `start`-`end`.   
The following special characters are supported:
- `^` refers to first line
- `$` refers to last line

Multiple ranges can be specified, separated by comma (`,`) characters.

## Behavior
Lines being matched by multiple ranges are only output once.

Ranges covering the full line range will be treated as pass-through, which means they will simply output their input as-is: (`-`, `^-$`).

## Examples
Due to the special markers (`^` and `$`) there will be some cases where multiple expressions yield the same result.

In the following examples, all possible combinations will be listed.

Get the first line of a file:
> `$ cat myfile | rl ^`   
> `$ cat myfile | rl 1`

Get the first 10 lines of a file:
> `$ cat myfile | rl 1-10`   
> `$ cat myfile | rl ^-10`

Get lines 5 to 10 and lines 25 to 30:
> `$ cat myfile | rl 5-10,25-30`

Get lines 1 to 10 and lines 50 to end:
> `$ cat myfile | rl 1-10,50-$`   
> `$ cat myfile | rl ^-10,50-$`

Get all lines of a file <sub>(Seems pretty useless to me)</sub>:
> `$ cat myfile | rl -`   
> `$ cat myfile | rl ^-$`

<br><hr>
<a name="footnotes"></a>
<sub>
Forgive me the use of cat for reading a file.<br>
Since rl was written specifically for piped input, using cat seemed more natural.
</sub>
