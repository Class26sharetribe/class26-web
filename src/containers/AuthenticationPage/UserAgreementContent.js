import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { propTypes } from '../../util/types';

import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';

import { H1 } from '../PageBuilder/Primitives/Heading';

const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// This "content-only" component can be used in modals etc.
const UserAgreementContent = props => {
  const { inProgress, error, data, featuredListings } = props;

  const hasContent = data => typeof data?.content === 'string';
  const exposeContentAsChildren = data => {
    return hasContent(data) ? { children: data.content } : {};
  };

  if (!data) {
    return null;
  }

  const CustomHeading1 = props => <H1 as="h2" {...props} />;

  return (
    <SectionBuilder
      {...data}
      options={{
        featuredListings,
        fieldComponents: {
          heading1: { component: CustomHeading1, pickValidProps: exposeContentAsChildren },
        },
        isInsideContainer: true,
      }}
    />
  );
};

UserAgreementContent.propTypes = {
  inProgress: bool,
  error: propTypes.error,
  data: object,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};
  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);
  return { pageAssetsData, featuredListingData, getListingEntitiesById, inProgress, error };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(UserAgreementContent);

export { UserAgreementContent };
