Have you been edited JS code and you have really long string literals that you
wished would be automatically broken and wrapped to fit your line length? Me
too, and that's what this module tries to achieve.

I designed it with `vim` in mind so you would use it like this:

  1. launch vim
  1. set as your `formatprg` with `:set fp=/path/to/this/repo/jsslb.js`
  1. select your long literals (can be multiple lines) in visual mode
  1. use `gq` to send those lines to this formatter
  1. profit

There's still a lot to do here. It doesn't even do the job it was designed for
perfectly but on top of that, it also need to take the place of the built in
formatter in vim, so:

  - only run in JS files
  - don't destroy lines we can't handle
  - ideally format anything correctly
