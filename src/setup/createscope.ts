import Scope from '../models/scope';
import { DocumentScope } from '../types';

export default async (scopeConfig = 'profile') => {
  const scope: DocumentScope | null = await Scope.findOne({ role: scopeConfig });

  if (scope) {
    return 'Scope not created: at least one scope already found in database.';
  }

  // FIXME: Fails when a non-admin user with same email already exists in the database

  const newScope = new Scope({ scope: scopeConfig });
  await newScope.save();
  return 'Scope successfully created';
};
