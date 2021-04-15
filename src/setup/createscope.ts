import Scope from '../models/scope';
import { DocumentScope, IScope } from '../types';

export default async (scopeConfig: IScope) => {
  const scope: DocumentScope | null = await Scope.findOne({ scope: scopeConfig.scope });

  if (scope) {
    return 'Scope not created: at least one scope already found in database.';
  }

  // FIXME: Fails when a non-admin user with same email already exists in the database

  const newScope = new Scope(scopeConfig);
  await newScope.save();
  return 'Scope successfully created';
};
