import { createOrUpdateLambda, CreateOrUpdateLambdaArguments } from './helpers';

export default (cmd: CreateOrUpdateLambdaArguments) =>
  createOrUpdateLambda(cmd, 'updateLambda');
