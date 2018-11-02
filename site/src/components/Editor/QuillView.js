import React from 'react';
import './highlight';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

const QuillView = ({ data }) => (
  <ReactQuill defaultValue={data} modules={{ syntax: true }} readOnly theme="bubble" />
);

export default QuillView;
