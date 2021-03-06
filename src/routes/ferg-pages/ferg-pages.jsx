'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ContentWrapper, Block, BlockTitle } from 'components/ui';
import { titleSet } from 'actions/title';
import { apiFetch, apiErrorDataClear } from 'actions/api';
import { getPagesType } from 'libs/pages';
import ItemsGrid from 'components/items-grid';
import Loader from 'components/loader';
import TagsCloud from 'components/tags-cloud';
import Paginator from 'components/paginator';
import Lang from 'libs/lang';
import langRu from './lang/ru';
import langEn from './lang/en';

const PAGES_TAGS_API_URL = '/api/tags/getTags';
const PAGES_TAGS_API_KEY = {
  blog: 'tags_blog',
  travel: 'tags_travel',
};
const PAGES_API_URL = '/api/pages/getPages';
const PAGES_API_KEY = {
  blog: 'pages_blog',
  travel: 'pages_travel',
};

Lang.updateLang('pages', langRu, 'ru');
Lang.updateLang('pages', langEn, 'en');

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  pages: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]).isRequired,
  tags: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
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
    
    const block = document.getElementById('ferg-pages');
    if (block) {
      const offset_top = block.offsetTop - 55;
      const window_scroll = window.scrollY;

      if (window_scroll > offset_top) {
        window.scrollTo(0, offset_top);
      }
    }
  }

  makeTags() {
    const tags = this.props.tags;

    if (!tags) return null;
    if (tags.loading) return <Block><Loader /></Block>;
    if (tags.error) return tags.error;
    if (!Object.keys(tags.results).length) {
      return Lang('pages.tags_not_found');
    }

    const url = `/${this.props.lang}/${this.props.type}/?tag=%tag%`;
    const selected_url = `/${this.props.lang}/${this.props.type}/`;

    return (
      <Block>
        <TagsCloud
          group={this.props.type}
          tags={tags.results}
          selected={this.props.pages ? this.props.pages.options.tag : ''}
          tagUrl={url}
          selectedTagUrl={selected_url}
        />
      </Block>
    );
  }

  makePages() {
    const pages = this.props.pages;

    if (!pages) return null;
    if (!pages.results.list && pages.loading) return null;
    if (pages.error) return pages.error;
    if (!pages.results.list.length) {
      return Lang('pages.photos_not_found');
    }

    const list = pages.results.list.map((page) => {
      return {
        type: page.type,
        date: page.timestamp,
        ratio: 0,
        title: page.title,
        desc: page.desc,
        url: `/${this.props.lang}/${page.type}/${page.id}`,
        preview: (page.preview && page.preview.small) ? page.preview.small : '',
      };
    });

    return (
      <Block id="ferg-pages">
        <ItemsGrid items={list} />
      </Block>
    );
  }

  makeLoader() {
    if (!this.props.pages || !this.props.pages.loading) return null;
    return <Block><Loader /></Block>;
  }

  makeTitle() {
    const pages = this.props.pages;

    if (!pages || !pages.options.tag) return null;

    return (
      <Block>
        <BlockTitle align="left">
          {pages.options.tag}
        </BlockTitle>
      </Block>
    );
  }

  makePagination() {
    const pages = this.props.pages;

    if (!pages ||
        pages.loading ||
        pages.error ||
        pages.results.pages <= 1) {
      return null;
    }

    let url = `/${this.props.lang}/${this.props.type}/?`;
    if (pages.options.tag) {
      url += `tag=${encodeURIComponent(pages.options.tag)}&`;
    }
    url += 'page=%page%';

    return (
      <Block>
        <Paginator
          page={pages.results.page}
          pages={pages.results.pages}
          url={url}
        />
      </Block>
    );
  }

  render() {
    return (
      <ContentWrapper>
        {this.makeTitle()}
        {this.makeLoader()}
        {this.makePages()}
        {this.makePagination()}
        {this.makeTags()}
      </ContentWrapper>
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
          page: parseInt(params.page, 10) || 1,
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
