// ref:
// - https://umijs.org/plugins/api
import { IApi } from '@umijs/types';
import { utils } from 'umi';
import { join } from 'path';

const DIR_NAME = 'plugin-deploy-control';

const DEFAULT_WHITE_LIST = [
  'http://localhost:8000',
  'http://localhost:8001',
  'http://localhost:8002',
  'https://magical-car.vercel.app',
];

export default function(api: IApi) {
  api.logger.info('use plugin');

  api.describe({
    key: 'deployWhiteList',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  const { deployWhiteList = [] } = api.userConfig;
  const whiteList = DEFAULT_WHITE_LIST.concat(deployWhiteList);
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: join(DIR_NAME, 'index.tsx'),
      content: `
      import React from 'react';
      export default (props)=>{
        const {children} = props;
        const canRender = ${JSON.stringify(whiteList)}.indexOf(window.location.origin) > -1;
        return <>{canRender && children}</>
      }
      `,
    });
  });

  api.modifyRoutes(routes => {
    return [
      {
        path: '/',
        component: utils.winPath(
          join(api.paths.absTmpPath || '', DIR_NAME, 'index.tsx'),
        ),
        routes,
      },
    ];
  });
}
