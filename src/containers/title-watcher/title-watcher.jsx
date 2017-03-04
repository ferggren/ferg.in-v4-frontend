'use strict';

import React from 'react';
import { connect } from 'react-redux';

const propTypes = {
  title: React.PropTypes.string.isRequired,
};

class TitleWatcher extends React.PureComponent {
  componentDidMount() {
    this.updateTitle();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.title !== this.props.title) {
      this.updateTitle();
    }
  }

  updateTitle() {
    document.title = this.props.title;
  }

  render() {
    return null;
  }
}

TitleWatcher.propTypes = propTypes;

export default connect((state) => {
  return {
    title: state.title,
  };
})(TitleWatcher);