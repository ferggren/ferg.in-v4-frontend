'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { AppContent } from 'components/app';
import { titleSet } from 'actions/title';
import { apiFetch, apiErrorDataClear } from 'actions/api';
import TagsCloud from 'components/tags-cloud';
import Paginator from 'components/paginator';
import Loader from 'components/loader';
import Lang from 'libs/lang';
import langRu from './lang/ru';
import langEn from './lang/en';

const GALLERY_TAGS_API_KEY = 'gallery_tags';
const GALLERY_TAGS_API_URL = '/api/tags/getTags';
const GALLERY_API_KEY = 'gallery';
const GALLERY_API_URL = '/api/gallery/getPhotos';

Lang.updateLang('gallery', langRu, 'ru');
Lang.updateLang('gallery', langEn, 'en');

const propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  lang: React.PropTypes.string.isRequired,
  location: React.PropTypes.object.isRequired,
  photos: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
  tags: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
};

class FergGallery extends React.PureComponent {
  componentWillMount() {
    this.updateTitle();
  }

  componentDidMount() {
    this.updateTitle();
    this.updateTags();
    this.updatePhotos();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lang !== this.props.lang) {
      this.updateTitle();
    }

    this.updateTags();
    this.updatePhotos();
  }

  componentWillUnmount() {
    this.props.dispatch(apiErrorDataClear(GALLERY_API_KEY));
    this.props.dispatch(apiErrorDataClear(GALLERY_TAGS_API_KEY));
  }

  updateTags() {
    const tags = this.props.tags;
    const group = 'gallery';

    if (tags && tags.options.group === group) {
      return;
    }

    this.props.dispatch(apiFetch(
      GALLERY_TAGS_API_KEY, GALLERY_TAGS_API_URL, { group, cache: true }
    ));
  }

  updatePhotos() {
    const photos = this.props.photos;
    const lang = this.props.lang;
    const query = this.props.location.query;
    const page = parseInt(query.page, 10) || 1;
    const tag = query.tag || '';

    if (photos &&
        photos.lang === lang &&
        photos.options.tag === tag &&
        photos.options.page === page
        ) {
      return;
    }

    this.props.dispatch(apiFetch(
      GALLERY_API_KEY, GALLERY_API_URL, { page, tag, cache: true }
    ));
    
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  updateTitle() {
    this.props.dispatch(titleSet(Lang('gallery.title')));
  }

  makeTags() {
    const tags = this.props.tags;

    if (!tags) return null;
    if (!Object.keys(tags.results).length) return null;
    if (tags.loading) return <Loader />;
    if (tags.error) return tags.error;

    const url = `/${this.props.lang}/gallery/?tag=%tag%`;
    const selected_url = `/${this.props.lang}/gallery/`;

    return (
      <TagsCloud
        group={'gallery'}
        tags={tags.results}
        selected={this.props.photos ? this.props.photos.options.tag : ''}
        tagUrl={url}
        selectedTagUrl={selected_url}
      />
    );
  }

  makePhotos() {
    const photos = this.props.photos;

    if (!photos) return null;
    if (!photos.results.photos && photos.loading) return <Loader />;
    if (photos.error) return photos.error;

    const html = JSON.stringify(photos, null, 2);

    return <pre dangerouslySetInnerHTML={{ __html: html }} />;
  }

  makePagination() {
    const photos = this.props.photos;

    if (!photos ||
        photos.loading ||
        photos.error ||
        photos.results.pages <= 1) {
      return null;
    }

    let url = `/${this.props.lang}/gallery/?`;
    if (photos.options.tag) {
      url += `tag=${encodeURIComponent(photos.options.tag)}&`;
    }
    url += 'page=%page%';

    return (
      <AppContent>
        <Paginator
          page={photos.results.page}
          pages={photos.results.pages}
          url={url}
        />
      </AppContent>
    );
  }

  render() {
    return (
      <div>
        <AppContent>
          {this.makePhotos()}
        </AppContent>

        {this.makePagination()}

        <AppContent>
          {this.makeTags()}
        </AppContent>
      </div>
    );
  }
}

FergGallery.propTypes = propTypes;

FergGallery.fetchData = function (store, params) {
  const state = store.getState();
  const ret = [];
  const api = state.api;

  if (!api[GALLERY_API_KEY]) {
    ret.push(
      store.dispatch(apiFetch(
        GALLERY_API_KEY, GALLERY_API_URL, {
          page: params.page || 1,
          tag: params.tag || '',
          cache: true,
        }
      ))
    );
  }

  if (!api[GALLERY_TAGS_API_KEY]) {
    ret.push(
      store.dispatch(apiFetch(
        GALLERY_TAGS_API_KEY, GALLERY_TAGS_API_URL, {
          group: 'gallery',
          cache: true,
        }
      ))
    );
  }

  if (!state.title) {
    store.dispatch(titleSet(Lang('gallery.title', {}, state.lang)));
  }

  return ret;
};

export default connect((state) => {
  return {
    lang: state.lang,
    photos: state.api[GALLERY_API_KEY] || false,
    tags: state.api[GALLERY_TAGS_API_KEY] || false,
  };
})(FergGallery);
