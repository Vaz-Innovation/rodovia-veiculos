// import { BatchLinkPlugin } from '@orpc/client/plugins';
import { ResponseValidationPlugin } from "@orpc/contract/plugins";

import { apiContract } from "@acme/api";

export const orpcPlugins = [
  new ResponseValidationPlugin(apiContract),
  // new BatchLinkPlugin({
  //   exclude: ({ path }) => {
  //     return path[0] === 'sse';
  //   },
  //   groups: [
  //     {
  //       condition: () => true,
  //       context: {},
  //     },
  //   ],
  // }),
];
