Negative unary expressions (-3)
Fix precedence on if expressions:
  a.push x if x
  IS:
  a.push(x if x)
  SHOULD BE:
  a.push(x) if x
Fix auto parens for regex arguments:
  a.push /ggg/g
  doesn't work