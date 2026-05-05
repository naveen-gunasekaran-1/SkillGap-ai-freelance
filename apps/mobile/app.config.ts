export default {
  expo: {
    name: 'SkillGap AI',
    slug: 'skillgap-ai',
    scheme: 'skillgapai',
    platforms: ['ios', 'android', 'web'],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001',
    },
  },
};
