// Copyright 2017-2025 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { styled } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

interface Props {
  className?: string;
}

function Footer ({ className = '' }: Props): React.ReactElement<Props> {
  const apiProps = useApi();

  const currentYear = new Date().getFullYear();

  return (
    <StyledDiv className={`${className}${(!apiProps.isApiReady || !apiProps.isApiConnected) ? ' isLoading' : ''}`}>
      <div className='menuContainer'>
        <div className='footer-item'>
          <span className='content-center'>@2023-{currentYear}. All rights reserved</span>
          <span className='content-center'>SecureSign by Tenet Crypto Lab</span>
          <img
            alt='footer'
            src='/logo-footer.webp'
            width={150}
          />
        </div>
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 100%;
  z-index: 220;
  position: relative;
  padding: 0.5rem 1rem 1rem 1rem;
  background-color: var(--bg-page);

  .content-center {
    align-content: center
  }
  .smallShow {
    display: none;
  }
  background-color: var(--bg-page);


  .menuContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    border-radius: 1rem;
    background-color: var(--bg-menubar);
  }

  // .menuContainer {
  //   background: var(--bg-footer);
  //   color: var(--color-footer);
  //   padding: 0.5rem;
  //   width: 100%;
  // }

  .footer-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: var(--font-size-h2);
  }
  &.isLoading {
    .menuActive {
      background: var(--bg-page);
    }

    &:before {
      filter: grayscale(1);
    }

    .menuItems {
      filter: grayscale(1);
    }
  }

  .menuSection {
    align-items: center;
    display: flex;
    .menuItems {
      list-style: none;
      margin: 0 0 0 0;
      padding: 0;
      font-size: var(--font-size-h1);
      color: var(--color-text-hover);
      font-weight: var(--font-weight-normal);
      text-transform: uppercase;
    }
  }

  .menuActive {
    background: var(--bg-tabs);
    border-bottom: none;
    border-radius: 0.25rem 0.25rem 0 0;
    color: var(--color-text);
    padding: 1rem 1.5rem;
    margin: 0 1rem -1px;
    z-index: 1;

    .ui--Icon {
      margin-right: 0.5rem;
    }
  }

  .ui--NodeInfo {
    align-self: center;
  }

  @media only screen and (max-width: 800px) {

    .smallShow {
      display: initial;
    }

    .smallHide {
      display: none;
    }
  }
`;

export default React.memo(Footer);
