import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Client from '../models/client';
import { DocumentUser } from '../types';
import { toAuthorizationRequest, toUser } from '../utils/utils';

const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorization = toAuthorizationRequest(req.query);
    const client = await Client.findOne({ clientId: authorization.client_id });
    //TODO: check for invalid client_id
    console.log(client);
    const { username, password } = toUser(req.body);
    const user: DocumentUser | null = await User.findOne({ username });
    if (!user) {
      throw new Error('probleema');
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new Error('probleema');
    }

    //TODO: redirect authorization code to callback address.
    res.status(200).send();
  } catch (error) {
    return next(error);
  }
};

export default {
  authorize
};
