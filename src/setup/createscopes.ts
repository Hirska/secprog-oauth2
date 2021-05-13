import Scope from '../models/scope';

const scopes = [
  { scope: 'profile:read', description: 'This gives access to your profile information', default: true },
  { scope: 'profile:write', description: 'This gives write access to your email' }
];

export default async () => {
  await Scope.deleteMany({});
  const savedScopes = await Scope.insertMany(scopes);
  console.log('Following scopes created:');
  console.log(savedScopes);
};
