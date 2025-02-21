// Copyright 2017-2025 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps as Props } from '@polkadot/react-components/types';

import React from 'react';
import { Route, Routes } from 'react-router';

import { styled } from '@polkadot/react-components';

import Accounts from './Accounts/index.js';
import Vanity from './Vanity/index.js';
import useCounter from './useCounter.js';

export { useCounter };

function AccountsApp ({ basePath, onStatusChange }: Props): React.ReactElement<Props> {
  return (
    <StyledMain className='accounts--App'>
      <Routes>
        <Route path={basePath}>
          <Route
            element={
              <Vanity onStatusChange={onStatusChange} />
            }
            path='vanity'
          />
          <Route
            element={
              <Accounts onStatusChange={onStatusChange} />
            }
            index
          />
        </Route>
      </Routes>
    </StyledMain>
  );
}

const StyledMain = styled.main`
  height: 100%;
`;

export default React.memo(AccountsApp);
