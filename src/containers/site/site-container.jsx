'use strict';

import React from 'react';
import { AppContainer } from 'components/app';
import SiteNavigation from './site-navigation';
import SiteFooter from './site-footer';

const propTypes = {
  children: React.PropTypes.node,
};

const defaultProps = {
  children: null,
};

class SiteContainer extends React.PureComponent {
  render() {
    return (
      <AppContainer>
        <SiteNavigation />

        {this.props.children}

        <SiteFooter />
      </AppContainer>
    );
  }
}

SiteContainer.propTypes = propTypes;
SiteContainer.defaultProps = defaultProps;

export default SiteContainer;
