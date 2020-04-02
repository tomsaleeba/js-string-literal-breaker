if !exists('g:jsslb_toggle_mapping') | let g:jsslb_toggle_mapping = '<leader>j' | en

" thanks https://stackoverflow.com/a/18734557/1410035
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h')
let s:origFp = &formatprg

function! JsslbToggle()
  if &formatprg == s:origFp
    let l:pathToJs = s:path . '/index.js'
    echo 'toggling jsslb (' . l:pathToJs . ') on'
    execute ":set formatprg=" . l:pathToJs
  else
    echo 'toggling jsslb off (formatprg=' . s:origFp . ')'
    execute ":set formatprg=" . s:origFp
  endif
endfunction

execute 'nmap' g:jsslb_toggle_mapping ':call JsslbToggle()<CR>'
