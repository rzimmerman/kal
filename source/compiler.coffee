{translate_sugar} = require './sugar'
{tokenize} = require './lexer'
{parse, Grammar} = require './parser'
{load} = require './generator'

exports.compile = (code) ->
  translated_code = translate_sugar code
  tokens = tokenize translated_code
  root_node = parse tokens
  load Grammar
  return root_node.js()
  
  
fs = require 'fs'
console.log exports.compile fs.readFileSync process.argv[2] if process.argv[2]?