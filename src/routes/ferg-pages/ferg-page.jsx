'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { AppContent } from 'components/app';
import { titleSet } from 'actions/title';
import { apiFetch, apiErrorDataClear } from 'actions/api';
import Loader from 'components/loader';
import TagsCloud from 'components/tags-cloud';
import Paginator from 'components/paginator';
import Lang from 'libs/lang';
import langRu from './lang/ru';
import langEn from './lang/en';

const PAGES_TAGS_API_URL = '/api/tags/getTags';
const PAGES_TAGS_API_KEY = {
  blog: 'pages_blog',
  events: 'pages_events',
};
const PAGES_API_URL = '/api/pages/getPages';
const PAGES_API_KEY = {
  blog: 'tags_blog',
  events: 'tags_events',
};

Lang.updateLang('pages', langRu, 'ru');
Lang.updateLang('pages', langEn, 'en');

function getPagesType(location) {
  const match = location.match(/^\/(?:en\/|ru\/)?(blog|events)\//);

  if (!match) return 'blog';
  return match[1];
}

const propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  lang: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  location: React.PropTypes.object.isRequired,
  pages: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
  tags: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]).isRequired,
};

class FergPages extends React.PureComponent {
  componentWillMount() {
    this.updateTitle();
  }

  componentDidMount() {
    this.updateTitle();
    this.updateTags();
    this.updatePages();
  }

  componentDidUpdate() {
    this.updateTitle();
    this.updateTags();
    this.updatePages();
  }

  componentWillUnmount() {
    this.props.dispatch(apiErrorDataClear(
      PAGES_API_KEY[this.props.type]
    ));

    this.props.dispatch(apiErrorDataClear(
      PAGES_TAGS_API_KEY[this.props.type]
    ));
  }

  updateTitle() {
    this.props.dispatch(titleSet(Lang(`pages.${this.props.type}-title`)));
  }

  updateTags() {
    const tags = this.props.tags;
    const group = this.props.type;

    if (tags && tags.options.group === group) {
      return;
    }

    this.props.dispatch(apiFetch(
      PAGES_TAGS_API_KEY[this.props.type], PAGES_TAGS_API_URL, {
        group,
        cache: true,
      }
    ));
  }

  updatePages() {
    const pages = this.props.pages;
    const type = this.props.type;
    const lang = this.props.lang;
    const query = this.props.location.query;
    const page = parseInt(query.page, 10) || 1;
    const tag = query.tag || '';

    if (pages &&
        pages.lang === lang &&
        pages.options.tag === tag &&
        pages.options.type === type &&
        pages.options.page === page
        ) {
      return;
    }

    this.props.dispatch(apiFetch(
      PAGES_API_KEY[type], PAGES_API_URL, {
        page,
        tag,
        type,
        cache: true,
      }
    ));
    
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  makeTags() {
    const tags = this.props.tags;

    if (!tags) return null;
    if (!Object.keys(tags.results).length) return null;
    if (tags.loading) return <Loader />;
    if (tags.error) return tags.error;

    const url = `/${this.props.lang}/${this.props.type}/?tag=%tag%`;
    const selected_url = `/${this.props.lang}/${this.props.type}/`;

    return (
      <TagsCloud
        group={this.props.type}
        tags={tags.results}
        selected={this.props.pages ? this.props.pages.options.tag : ''}
        tagUrl={url}
        selectedTagUrl={selected_url}
      />
    );
  }

  makePages() {
    const pages = this.props.pages;

    if (!pages) return null;
    if (!pages.results.list && pages.loading) return <Loader />;
    if (pages.error) return pages.error;

    const html = JSON.stringify(pages, null, 2);

    return <pre dangerouslySetInnerHTML={{ __html: html }} />;
  }

  makePagination() {
    const pages = this.props.pages;

    if (!pages ||
        pages.loading ||
        pages.error ||
        pages.results.pages <= 1) {
      return null;
    }

    let url = `/${this.props.lang}/gallery/?`;
    if (pages.options.tag) {
      url += `tag=${encodeURIComponent(pages.options.tag)}&`;
    }
    url += 'page=%page%';

    return (
      <AppContent>
        <Paginator
          page={pages.results.page}
          pages={pages.results.pages}
          url={url}
        />
      </AppContent>
    );
  }

  render() {
    return (
      <div>
        <AppContent>
          {this.makePages()}
        </AppContent>

        {this.makePagination()}
        
        <AppContent>
          {this.makeTags()}
        </AppContent>
      </div>
    );
  }
}

FergPages.propTypes = propTypes;

FergPages.fetchData = function (store, params) {
  const state = store.getState();
  const type = getPagesType(params.location);
  const ret = [];
  const api = state.api;

  if (!api[PAGES_API_KEY[type]]) {
    ret.push(
      store.dispatch(apiFetch(
        PAGES_API_KEY[type], PAGES_API_URL, {
          type,
          page: params.page || 1,
          tag: params.tag || '',
          cache: true,
        }
      ))
    );
  }

  if (!api[PAGES_TAGS_API_KEY[type]]) {
    ret.push(
      store.dispatch(apiFetch(
        PAGES_TAGS_API_KEY[type], PAGES_TAGS_API_URL, {
          group: type,
          cache: true,
        }
      ))
    );
  }

  if (!state.title) {
    store.dispatch(titleSet(Lang(`pages.${type}-title`, {}, state.lang)));
  }

  return ret;
};

export default connect((state) => {
  const type = getPagesType(state.location);

  return {
    type,
    lang: state.lang,
    pages: state.api[PAGES_API_KEY[type]] || false,
    tags: state.api[PAGES_TAGS_API_KEY[type]] || false,
  };
})(FergPages);