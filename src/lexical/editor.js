import { createEditor } from 'lexical';
import { registerDragonSupport } from '@lexical/dragon';
import { registerRichText } from '@lexical/rich-text';
import { PillNode } from './nodes/PillNode';

const editor = createEditor({
  namespace: 'lexical-editor',
  nodes: [PillNode],
  onError: (error) => {
    console.error(error);
  },
});

registerRichText(editor);
registerDragonSupport(editor);

export default editor;
