import { useCallback } from 'react';
import { apiUrl } from '@madfi/jam-core';
import { useJam } from './JamContext';
import { use } from './lib/state-tree-react';
import { signedToken } from './lib/identity-utils';
import GetRequest from './lib/GetRequest';

export { useApiQuery };

function useApiQuery(
  path: string,
  { dontFetch = false, fetchOnMount = false } = {}
) {
  const [state] = useJam();
  const getToken = useCallback(() => signedToken(state.myIdentity), []);
  let { data, isLoading, status } = use(
    GetRequest,
    {
      path: apiUrl() + path,
      dontFetch,
      fetchOnMount,
      getToken,
    },
    null
  );
  return [data as unknown, isLoading as boolean, status as number] as const;
}
