import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { PillNode } from './nodes/PillNode.jsx';
import PillPlugin from './plugins/PillPlugin';

// Plugin to update editor content when the external value changes,
// but only if the change wasn't triggered by the editor itself.
function UpdatePlugin({ value }) {
  const [editor] = useLexicalComposerContext();
  const previousValue = useRef(value);

  useEffect(() => {
    // Only update if the value prop actually changed
    if (previousValue.current === value) {
      return;
    }
    
    previousValue.current = value;
    
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(value || ''));
      root.append(paragraph);
    });
  }, [value, editor]);

  return null;
}

function LexicalEditor({ value, onChange, variables, placeholder }) {
  const initialConfig = {
    namespace: 'LexicalEditor',
    nodes: [PillNode],
    onError: (error) => {
      console.error('Lexical error:', error);
    },
    editorState: null,
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      if (onChange && text !== value) {
        onChange({ target: { value: text } });
      }
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="lexical-content-editable" />}
          placeholder={<div className="lexical-placeholder">{placeholder || 'Enter text...'}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
        <PillPlugin variables={variables} />
        <UpdatePlugin value={value} />
      </div>
    </LexicalComposer>
  );
}

export default LexicalEditor;
