'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'components/loader';
import { Link, browserHistory } from 'react-router';
import './styles';

const propTypes = {
  lang: PropTypes.string.isRequired,
  photo: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]).isRequired,
  next: PropTypes.oneOfType([
    PropTypes.bool.isRequired,
    PropTypes.array.isRequired,
  ]).isRequired,
  prev: PropTypes.oneOfType([
    PropTypes.bool.isRequired,
    PropTypes.array.isRequired,
  ]).isRequired,
  tag: PropTypes.oneOfType([
    PropTypes.bool.isRequired,
    PropTypes.string.isRequired,
  ]).isRequired,
};

class PhotoExposition extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  getNextPhotoLink() {
    if (!this.props.prev || !this.props.prev.length) {
      return null;
    }

    const prev = this.props.prev[0].id;
    let url = `/${this.props.lang}/photostream/${prev}`;

    if (this.props.tag) {
      url += `?tag=${encodeURIComponent(this.props.tag)}`;
    }

    return url;
  }

  getPrevPhotoLink() {
    if (!this.props.next || !this.props.next.length) {
      return null;
    }

    const next = this.props.next[0].id;
    let url = `/${this.props.lang}/photostream/${next}`;

    if (this.props.tag) {
      url += `?tag=${encodeURIComponent(this.props.tag)}`;
    }

    return url;
  }

  handleKeyDown(e) {
    if (e.keyCode === 37) {
      const prev = this.getPrevPhotoLink();

      if (prev) {
        browserHistory.push(prev);
      }
    }

    if (e.keyCode === 39) {
      const next = this.getNextPhotoLink();

      if (next) {
        browserHistory.push(next);
      }
    }
  }

  makePhoto() {
    const photo = this.props.photo;

    if (!photo || !photo.photo_big) return null;

    const props = {
      className: 'photo-exposition__photo',
      src: photo.photo_big,
    };

    if (photo.width) {
      props.width = `${photo.width}px`;
    }

    if (photo.height) {
      props.height = `${photo.height}px`;
    }

    return (
      <a href={photo.photo_big} target="_blank" rel="noreferrer noopener" className="photo-exposition__photo-wrapper">
        <img {...props} />
      </a>
    );
  }

  makeNavigation() {
    if (!this.props.next && !this.props.prev && !this.props.photo) return null;

    return (
      <div className="photo-exposition__navigation">
        {this.makeNavigationPrev()}
        {this.makeNavigationSlider()}
        {this.makeNavigationNext()}
      </div>
    );
  }

  makeNavigationNext() {
    const next = this.getNextPhotoLink();

    if (!next) {
      return null;
    }

    return (
      <Link
        className="photo-exposition__navigation-button photo-exposition__navigation-button--next"
        to={next}
      >
        &gt;
      </Link>
    );
  }

  makeNavigationPrev() {
    const prev = this.getPrevPhotoLink();

    if (!prev) {
      return null;
    }

    return (
      <Link
        className="photo-exposition__navigation-button photo-exposition__navigation-button--prev"
        to={prev}
      >
        &lt;
      </Link>
    );
  }

  makeNavigationSlider() {
    const next = this.props.next;
    const prev = this.props.prev;
    const photo = this.props.photo;
    const list = [];

    if (next) {
      for (let i = 0; i < next.length; ++i) {
        list.unshift(next[i]);
      }
    }

    if (photo) list.push(photo);

    if (prev) {
      for (let i = 0; i < prev.length; ++i) {
        list.push(prev[i]);
      }
    }

    const slider = list.map((item) => {
      const props = {
        className: 'photo-exposition__navigation-link',
        key: item.id,
        to: `/${this.props.lang}/photostream/${item.id}`,
        style: {
          backgroundImage: `url('${item.preview}')`,
        },
      };

      if (this.props.tag) {
        props.to += `?tag=${encodeURIComponent(this.props.tag)}`;
      }

      if (item.id === photo.id) {
        props.className += ' photo-exposition__navigation-link--current';
      }

      return (
        <Link {...props} />
      );
    });

    return (
      <div className="photo-exposition__navigation-slider">
        {slider}
      </div>
    );
  }

  makeLoader() {
    return (
      <div className="photo-exposition__loader">
        <Loader />
      </div>
    );
  }

  render() {
    return (
      <div className="photo-exposition">
        {this.makeLoader()}
        {this.makePhoto()}
        {this.makeNavigation()}
      </div>
    );
  }
}

PhotoExposition.propTypes = propTypes;

export default PhotoExposition;
