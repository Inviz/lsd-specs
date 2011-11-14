content = File.open('Configuration.js').read
around_curlies = "(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*\\})*\\})"
presets = content.match(%r"Configuration.presets = ({#{around_curlies}+?})")
sets = content.match(%r"Configuration.sets = ({#{around_curlies}+?})")
return unless presets

require 'json'
require 'yaml'

presets = JSON.parse(presets[1].gsub(/'/, '"').gsub('sets:', '"sets":').gsub('source:', '"source":'))
sets = JSON.parse(sets[1].gsub(/'/, '"').gsub('path:', '"path":').gsub('files:', '"files":'))


files = sets.inject([]) do |memo, (key, value)|
  (value["files"] || []).each do |file|
    memo << (value["path"] + "") + file
  end
  memo
end

p files.to_yaml
