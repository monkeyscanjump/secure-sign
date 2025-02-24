// Copyright 2017-2025 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Judgement } from '@polkadot/react-hooks/types';
import type { DisplayedJudgement } from '../types.js';

import React, { useMemo } from 'react';

import AddressSmall from '../AddressSmall.jsx';
import Menu from '../Menu/index.jsx';
import Popup from '../Popup/index.jsx';
import Tag from '../Tag.jsx';

interface Props {
  judgement: Judgement
}

export function getJudgementColor (name: DisplayedJudgement): 'green' | 'red' {
  return (name === 'Erroneous' || name === 'Low quality')
    ? 'red'
    : 'green';
}

function JudgementTag ({ judgement: { judgementName, registrars } }: Props): React.ReactElement<Props> {
  const judgementColor = useMemo(() => getJudgementColor(judgementName), [judgementName]);

  return (
    <Popup
      closeOnScroll
      position='middle'
      value={
        <Menu>
          {registrars.map((registrar) => registrar && (
            <AddressSmall
              key={registrar.address}
              value={registrar.address}
            />
          ))}
        </Menu>
      }
    >
      <Tag
        color={judgementColor}
        label={`${registrars.length} ${judgementName}`}
        size='tiny'
      />
    </Popup>
  );
}

export default React.memo(JudgementTag);
