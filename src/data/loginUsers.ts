import { getEnv } from '../config/env';

export type LoginUser = {
  label: string;
  username: string;
  password: string;
};

export const loginUsers: LoginUser[] = [
  {
    label: 'standard_user',
    username: getEnv('VALID_USERNAME'),
    password: getEnv('VALID_PASSWORD'),
  },
];
