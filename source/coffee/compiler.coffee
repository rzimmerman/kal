{translate_sugar} = require './sugar'
{tokenize} = require './lexer'
{parse, Grammar} = require './parser'
{load} = require './generator'

exports.compile = (code) ->
  [raw_tokens, comments] = tokenize code
  tokens = translate_sugar raw_tokens
  root_node = parse tokens, comments
  load Grammar
  return root_node.js()
  
  
fs = require 'fs'
assert = require 'assert'
code = exports.compile fs.readFileSync process.argv[2] if process.argv[2]?
if process.argv[3]?
  fs.writeFileSync process.argv[3], code
else
  console.log code
  console.log eval(code)