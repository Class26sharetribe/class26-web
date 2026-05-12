/////////////////////////////////////////////////////////
// Mock seller users for runtime UI prototyping.        //
/////////////////////////////////////////////////////////

const MOCK_PROFILE_IMAGE_VARIANTS = [
  { name: 'square-xsmall', width: 40, height: 40 },
  { name: 'square-xsmall2x', width: 80, height: 80 },
  { name: 'square-small', width: 240, height: 240 },
  { name: 'square-small2x', width: 480, height: 480 },
  { name: 'seller-search-card', width: 640, height: 400 },
  { name: 'seller-search-card-2x', width: 1280, height: 800 },
  { name: 'seller-landing-card', width: 480, height: 600 },
  { name: 'seller-landing-card-2x', width: 960, height: 1200 },
];

export const createMockProfileImage = (sellerId, avatarUrl) => {
  if (!avatarUrl) {
    return null;
  }

  const variants = MOCK_PROFILE_IMAGE_VARIANTS.reduce((variantMap, variant) => {
    const { name, width, height } = variant;

    return {
      ...variantMap,
      [name]: {
        name,
        width,
        height,
        url: avatarUrl,
      },
    };
  }, {});

  return {
    id: { uuid: `${sellerId}-profile-image` },
    type: 'image',
    attributes: {
      variants,
    },
  };
};

const createMockSellerUser = params => {
  const {
    slug,
    firstName = '',
    lastName = '',
    displayName = '',
    abbreviatedName = '',
    bio = '',
    professionalTitle = '',
    rating = null,
    avatarUrl = '',
    expertise = [],
    languages = [],
    productTypes = [],
  } = params;
  const sellerId = `mock-seller-${slug}`;

  return {
    id: { uuid: sellerId },
    type: 'user',
    attributes: {
      banned: false,
      deleted: false,
      profile: {
        firstName,
        lastName,
        displayName,
        abbreviatedName,
        bio,
        publicData: {
          slug,
          professionalTitle,
          rating,
          avatarUrl,
          expertise,
          languages,
          productTypes,
        },
      },
    },
    profileImage: createMockProfileImage(sellerId, avatarUrl),
  };
};

export const mockSellerUsers = [
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/LXEMQno.jpeg',
    slug: 'thijs-de-vries',
    firstName: 'Thijs',
    lastName: 'de Vries',
    displayName: 'Thijs de Vries',
    abbreviatedName: 'TV',
    professionalTitle: 'Lead AI Research Scientist & Investor',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/znChZGH.jpeg',
    slug: 'ayse-gumus',
    firstName: 'Ayse',
    lastName: 'Gumus',
    displayName: 'Ayse Gumus',
    abbreviatedName: 'AG',
    professionalTitle: 'Founder & CEO at Class26',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/XH7rD6t.jpeg',
    slug: 'eleanor-withmore',
    firstName: 'Eleanor',
    lastName: 'Withmore',
    displayName: 'Eleanor Withmore',
    abbreviatedName: 'EW',
    professionalTitle: 'Head of Growth & Product-Led Acquisition',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/vDfUoBA.jpeg',
    slug: 'sophie-janssen',
    firstName: 'Sophie',
    lastName: 'Janssen',
    displayName: 'Sophie Janssen',
    abbreviatedName: 'SJ',
    professionalTitle: 'VP of Engineering & Platform Architecture',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/eX0zasQ.jpeg',
    slug: 'james-harrington',
    firstName: 'James',
    lastName: 'Harrington',
    displayName: 'James Harrington',
    abbreviatedName: 'JH',
    professionalTitle: 'Senior ESG Risk Strategist',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
  createMockSellerUser({
    avatarUrl: 'https://i.imgur.com/zwWf6qf.jpeg',
    slug: 'daan-van-der-meer',
    firstName: 'Daan',
    lastName: 'van der Meer',
    displayName: 'Daan van der Meer',
    abbreviatedName: 'DM',
    professionalTitle: 'Chief Decentralised Finance Compliance Officer',
    rating: 5,
    expertise: ['Personal Growth', 'Leadership', 'AI & Human Development'],
    languages: ['Dutch', 'English'],
    productTypes: ['Video Course', 'Digital Download'],
  }),
];

export const getMockSellerBySlug = slug =>
  mockSellerUsers.find(seller => seller.attributes.profile.publicData.slug === slug);
