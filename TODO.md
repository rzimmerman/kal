Negative unary expressions (-3)
Fix precedence on if expressions:
  a.push x if x
  IS:
  a.push(x if x)
  SHOULD BE:
  a.push(x) if x
Fix auto parens for regex arguments and index expressions:
  a.push /ggg/g
  a[3] 4
  doesn't work
Fix string constants so that they actually parse what is inside of the #{} blocks