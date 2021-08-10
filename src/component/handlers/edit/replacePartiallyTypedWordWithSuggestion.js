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

import type SelectionState from 'SelectionState';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const getEntityKeyForSelection = require('getEntityKeyForSelection');

function getPartiallyTypedWordRange(
  editorState: EditorState
): SelectionState {
  const selection = editorState.getSelection();

  // This should never happen because all functions in this module should
  // only be called once we know that selection is collapsed!
  if (!selection.isCollapsed()) {
    return selection;
  }

  const anchorKey = selection.getAnchorKey();
  const anchorOffset = selection.getAnchorOffset();

  const wordArray = editorState
    .getCurrentContent()
    .getBlockForKey(anchorKey)
    .getText()
    .slice(0, anchorOffset)
    .split(' ');

  const partiallyTypedWordLength = wordArray[wordArray.length - 1].length;

  return selection.merge({
    anchorOffset: anchorOffset - partiallyTypedWordLength,
    focusOffset: anchorOffset,
    isBackward: false
  });
}

function replacePartiallyTypedWordWithSuggestion(
  editorState: EditorState,
  suggestion: string
): EditorState {
  const currentContent = editorState.getCurrentContent();
  const targetRange = getPartiallyTypedWordRange(editorState);

  const contentState = DraftModifier.replaceText(
    currentContent,
    targetRange,
    suggestion,
    editorState.getCurrentInlineStyle(),
    getEntityKeyForSelection(
      currentContent,
      editorState.getSelection()
    )
  );

  return EditorState.push(
    editorState,
    contentState,
    'insert-characters',
    false
  );
}

module.exports = replacePartiallyTypedWordWithSuggestion;
