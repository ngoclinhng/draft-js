/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const getEntityKeyForSelection = require('getEntityKeyForSelection');

/**
 * Replace the current selection range with an empty string. If the current
 * selection is collapsed, then this is a no-ops (right?), otherwise,
 * the entire text from the selection range will be removed.
 */
function replaceCurrentSelectionRangeWithEmptyString(
  editorState: EditorState
): EditorState {
  const currContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  const nextContent = DraftModifier.replaceText(
    currContent,
    selection,
    ''/* an empty string */,
    editorState.getCurrentInlineStyle(),
    getEntityKeyForSelection(currContent, selection)
  );

  return EditorState.push(
    editorState,
    nextContent,
    'insert-characters',
    true/* force selection */
  );
}

/**
 * The user has begun using an IME input system. Switching to `composite` mode
 * allows handling composition input and disables other edit behavior.
 */
function editOnCompositionStart(
  editor: DraftEditor,
  e: SyntheticEvent<>,
): void {
  editor.setMode('composite');

  // https://github.com/facebook/draft-js/issues/2718
  const latestEditorState = replaceCurrentSelectionRangeWithEmptyString(
    editor._latestEditorState
  );

  editor.update(
    EditorState.set(latestEditorState, {inCompositionMode: true})
  );

  // Allow composition handler to interpret the compositionstart event
  editor._onCompositionStart(e);
}

module.exports = editOnCompositionStart;
