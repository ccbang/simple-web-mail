import React from 'react';
import './highlight';
import ReactQuill, { Quill } from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import ImageResize from 'quill-image-resize-module-react';
import 'react-quill/dist/quill.snow.css';

// 在quiil中注册quill-image-drop-module
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);

export default class NewPage extends React.Component {
  constructor(props) {
    super(props);
    this.quillRef = null; // Quill instance
    this.reactQuillRef = null; // ReactQuill component
    this.state = {
      value: props.data || '',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote', { color: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'code-block'],
          ['clean'],
        ],
        history: {
          // Enable with custom configurations
          delay: 2500,
          userOnly: true,
        },
        imageDrop: true,
        syntax: true,
        imageResize: {
          parchment: Quill.import('parchment'),
        },
      },
    };
  }

  componentDidMount() {
    this.attachQuillRefs();
  }

  componentDidUpdate() {
    this.attachQuillRefs();
  }

  attachQuillRefs = () => {
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    this.quillRef = this.reactQuillRef.getEditor();
  };

  handleChange = value => {
    const { onChange, onCanPost } = this.props;
    this.setState({
      value,
    });
    if (onChange && !onCanPost) {
      onChange(value);
    }
  };

  handleFocus = () => {
    const { onCanPost } = this.props;
    if (onCanPost) {
      onCanPost(false);
    }
  };

  handleBlur = () => {
    const { onChange, onCanPost } = this.props;
    const { value } = this.state;
    if (onChange && onCanPost) {
      const contentText = this.quillRef.getText();
      onChange(value, contentText);
      onCanPost(true);
    }
  };

  render() {
    const { value, modules } = this.state;
    return (
      <ReactQuill
        value={value}
        ref={el => {
          this.reactQuillRef = el;
        }}
        onChange={this.handleChange}
        modules={modules}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        placeholder="简单描述下你的问题"
        style={{ background: '#ffffff', lineHeight: 1.5 }}
      />
    );
  }
}
