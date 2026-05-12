import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const TOS_ASSET_NAME = 'terms-of-service';
export const PRIVACY_POLICY_ASSET_NAME = 'privacy-policy';
export const USER_AGREEMENT_ASSET_NAME = 'user-agreement';
export const COMMUNITY_GUIDELINES_ASSET_NAME = 'community-guidelines';

export const loadData = (params, search) => dispatch => {
  const pageAsset = {
    termsOfService: `content/pages/${TOS_ASSET_NAME}.json`,
    privacyPolicy: `content/pages/${PRIVACY_POLICY_ASSET_NAME}.json`,
    userAgreement: `content/pages/${USER_AGREEMENT_ASSET_NAME}.json`,
    communityGuidelines: `content/pages/${COMMUNITY_GUIDELINES_ASSET_NAME}.json`,
  };
  return dispatch(fetchPageAssets(pageAsset, true));
};
