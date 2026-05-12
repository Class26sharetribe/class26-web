import { fetchPageAssets } from '../../ducks/hostedAssets.duck';

export const TOS_ASSET_NAME = 'terms-of-service';
export const PRIVACY_POLICY_ASSET_NAME = 'privacy-policy';
export const EXPERT_COLLABORATION_AGREEMENT_ASSET_NAME = 'expert-collaboration-agreement';
export const COMMUNITY_GUIDELINES_ASSET_NAME = 'community-guidelines';
export const EXPERT_CONDUCT_POLICY_ASSET_NAME = 'expert-conduct-policy';

export const loadData = (params, search) => dispatch => {
  const pageAsset = {
    termsOfService: `content/pages/${TOS_ASSET_NAME}.json`,
    privacyPolicy: `content/pages/${PRIVACY_POLICY_ASSET_NAME}.json`,
    expertCollaborationAgreement: `content/pages/${EXPERT_COLLABORATION_AGREEMENT_ASSET_NAME}.json`,
    communityGuidelines: `content/pages/${COMMUNITY_GUIDELINES_ASSET_NAME}.json`,
    expertConductPolicy: `content/pages/${EXPERT_CONDUCT_POLICY_ASSET_NAME}.json`,
  };
  return dispatch(fetchPageAssets(pageAsset, true));
};
