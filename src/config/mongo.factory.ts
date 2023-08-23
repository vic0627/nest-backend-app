import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => {
  const resource = process.env.MONGODB_RESOURCE;
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  const uri = `mongodb+srv://${username}:${password}@${resource}?retryWrites=true&w=majority`;

  return {
    resource,
    username,
    password,
    uri,
  };
});
