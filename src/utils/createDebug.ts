import debug from 'debug';

const createDebug = (name?: string): ReturnType<typeof debug> =>
  debug(`app${name ? `:${name}` : ''}`);

export default createDebug;
