**warning** I stopped working on this as soon as it did what I needed. I'm also
a vimscript n00b so if that bit looks wrong, it probably is.

Have you been edited JS code and you have really long string literals that you
wished would be automatically broken and wrapped to fit your line length? Me
too, and that's what this module tries to achieve.

There's a relevant question on StackExchange:
https://vi.stackexchange.com/questions/15764/how-to-format-quotes-so-that-vim-breaks-long-lines-into-multiple-quotes-on-mult

I designed it with `vim` in mind so you would use it like this:

  1. launch vim
  1. set as your `formatprg` with `:set fp=/path/to/this/repo/jsslb.js`
  1. select your long literals (can be multiple lines) in visual mode
  1. use `gq` to send those lines to this formatter (or `gqq` without a
     selection)
  1. revert setting the `formatprg` option as this script can't handle anything else
  1. profit

There is a vim script in this directory that you can source to make life
easier. It binds a leader sequence so you can easily toggle the this formatter
on and off. To use it, in vim just source the script `:source
/path/to/this/repo/script.vim`. The default mapping is `<leader>j`.

Currently it only formats correctly when the string is the only thing on the
line, so something like what you see in `./test-data.txt` or:
```console
echo "    'some really long string that is wider than the allowable textwidth, which defaults to 80 but can be changed by setting the TW env var'" | ./jsslb.js
    'some really long string that is wider than the allowable textwidth, ' +
    'which defaults to 80 but can be changed by setting the TW env var'
```

The default textwidth is 80 but you can configure that with the `TW` env var:
```console
TW=40 echo "    'some really long string that is wider than the allowable textwidth, which defaults to 80 but can be changed by setting the TW env var'" | ./jsslb.js
    'some really long string that is ' +
    'wider than the allowable ' +
    'textwidth, which defaults to 80 ' +
    'but can be changed by setting ' +
    'the TW env var'
```
