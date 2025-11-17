import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createTextNode, $isTextNode } from 'lexical';
import { $createPillNode, PillNode } from '../nodes/PillNode.jsx';

function PillPlugin({ variables }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(PillNode, (node) => {
      // Update pill nodes when variables change
      const name = node.__name;
      const newValue = variables?.[name] || '';
      const isFilled = newValue.trim().length > 0;
      const displayValue = isFilled ? newValue : `<<${name}>>`;
      
      if (node.__value !== displayValue || node.__isFilled !== isFilled) {
        const newPill = $createPillNode(name, displayValue, isFilled);
        node.replace(newPill);
      }
    });
  }, [editor, variables]);

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform($createTextNode().constructor, (textNode) => {
      if (!$isTextNode(textNode)) return;
      
      const text = textNode.getTextContent();
      const regex = /<<([^>]+)>>/g;
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length === 0) return;
      
      // Build replacement nodes
      const nodes = [];
      let lastIndex = 0;
      
      for (const match of matches) {
        const varName = match[1];
        const varValue = variables?.[varName] || '';
        const isFilled = varValue.trim().length > 0;
        const displayValue = isFilled ? varValue : `<<${varName}>>`;
        
        // Add text before the variable
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText) {
            nodes.push($createTextNode(beforeText));
          }
        }
        
        // Add the pill
        nodes.push($createPillNode(varName, displayValue, isFilled));
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text after last variable
      if (lastIndex < text.length) {
        const afterText = text.substring(lastIndex);
        if (afterText) {
          nodes.push($createTextNode(afterText));
        }
      }
      
      // Replace the text node with our new nodes
      if (nodes.length > 0) {
        // Insert all nodes after the current text node
        for (let i = nodes.length - 1; i >= 0; i--) {
          textNode.insertAfter(nodes[i]);
        }
        // Remove the original text node
        textNode.remove();
      }
    });

    return removeTransform;
  }, [editor, variables]);

  return null;
}

export default PillPlugin;
