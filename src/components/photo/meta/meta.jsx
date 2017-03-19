'use strict';

import React from 'react';
import { AppContent } from 'components/app';
import TagsCloud from 'components/tags-cloud';
import Lang from 'libs/lang';
import langRu from './lang/ru';
import langEn from './lang/en';
import './styles';

Lang.updateLang('gallery-photo', langRu, 'ru');
Lang.updateLang('gallery-photo', langEn, 'en');

const propTypes = {
  lang: React.PropTypes.string.isRequired,
  photo: React.PropTypes.object.isRequired,
};

class PhotoMeta extends React.PureComponent {
  makeLocation() {
    return null;
  }

  makeMeta() {
    const photo = this.props.photo;
    const tags = photo.tags || {};
    const ret = [];

    const details = {
      camera: tags.camera,
      lens: tags.lens,
      info: [],
    };

    ['shutter_speed', 'aperture', 'iso'].forEach((key) => {
      if (!tags[key]) return;

      details.info.push(Lang(
        `gallery-photo.photo_${key}`, {
          param: tags[key],
        }
      ));
    });

    details.info = details.info.join(', ');

    Object.keys(details).forEach((key) => {
      if (!details[key]) return;

      ret.push(
        <div key={key} className={`photo-meta__tag photo-meta__tag--${key}`}>
          {details[key]}
        </div>
      );
    });

    if (!ret.length) return null;

    return (
      <AppContent>
        {ret}
      </AppContent>
    );
  }

  makeTags() {
    const photo = this.props.photo;
    const category = photo.tags.category || '';
    const tags = {};

    category.split(',').forEach((tag) => {
      tag = tag.trim();
      if (tag) tags[tag] = 1;
    });

    return (
      <AppContent>
        <TagsCloud
          group="gallery"
          tags={tags}
          tagUrl={`/${this.props.lang}/gallery/?tag=%tag%`}
        />
      </AppContent>
    );
  }

  render() {
    return (
      <div>
        {this.makeLocation()}
        {this.makeMeta()}
        {this.makeTags()}
      </div>
    );
  }
}

PhotoMeta.propTypes = propTypes;

export default PhotoMeta;