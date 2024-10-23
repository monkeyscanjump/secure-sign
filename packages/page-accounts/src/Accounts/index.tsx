// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';
import type { AccountBalance, Delegation, SortedAccount } from '../types.js';
import type { SortCategory } from '../util.js';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { styled, MultisigTable } from '@polkadot/react-components';
import { getAccountCryptoType } from '@polkadot/react-components/util';
import { useAccounts, useDelegations, useFavorites, useNextTick, useProxies, useToggle } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import CreateModal from '../modals/Create.js';
import ImportModal from '../modals/Import.js';
import Ledger from '../modals/Ledger.js';
import Local from '../modals/LocalAdd.js';
import Multisig from '../modals/MultisigCreate.js';
import Proxy from '../modals/ProxiedAdd.js';
import Qr from '../modals/Qr.js';
import { useTranslation } from '../translate.js';
import { sortAccounts } from '../util.js';
import Account from './Account.js';
import BannerClaims from './BannerClaims.js';

interface Balances {
  accounts: Record<string, AccountBalance>;
  summary?: AccountBalance;
}

interface Props {
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
}

interface SortControls {
  sortBy: SortCategory;
  sortFromMax: boolean;
}

type GroupName = 'injected'| 'testing';

const DEFAULT_SORT_CONTROLS: SortControls = { sortBy: 'date', sortFromMax: true };

const STORE_FAVS = 'accounts:favorites';

const GROUP_ORDER: GroupName[] = ['injected', 'testing'];

function groupAccounts (accounts: SortedAccount[]): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    injected: [],
    testing: []
  };

  for (let i = 0, count = accounts.length; i < count; i++) {
    const { address } = accounts[i];
    const cryptoType = getAccountCryptoType(address);

    if (cryptoType !== 'multisig') {
      ret.testing.push(address);
    }
  }

  return ret;
}

function Overview ({ className = '', onStatusChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts } = useAccounts();
  const [isCreateOpen, toggleCreate] = useToggle();
  const [isImportOpen, toggleImport] = useToggle();
  const [isLedgerOpen, toggleLedger] = useToggle();
  const [isMultisigOpen, toggleMultisig] = useToggle();
  const [isProxyOpen, toggleProxy] = useToggle();
  const [isLocalOpen, toggleLocal] = useToggle();
  const [isQrOpen, toggleQr] = useToggle();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS);
  const [balances, setBalances] = useState<Balances>({ accounts: {} });
  const [filterOn, setFilter] = useState<string>('');
  const [sortedAccounts, setSorted] = useState<SortedAccount[]>([]);
  const [{ sortBy, sortFromMax }, setSortBy] = useState<SortControls>(DEFAULT_SORT_CONTROLS);
  const delegations = useDelegations();
  const proxies = useProxies();
  const isNextTick = useNextTick();

 console.log('', setFilter, setSortBy);
 

  const setBalance = useCallback(
    (account: string, balance: AccountBalance) =>
      setBalances(({ accounts }: Balances): Balances => {
        accounts[account] = balance;

        const aggregate = (key: keyof AccountBalance) =>
          Object.values(accounts).reduce((total: BN, value: AccountBalance) => total.add(value[key]), BN_ZERO);

        return {
          accounts,
          summary: {
            bonded: aggregate('bonded'),
            locked: aggregate('locked'),
            redeemable: aggregate('redeemable'),
            total: aggregate('total'),
            transferable: aggregate('transferable'),
            unbonding: aggregate('unbonding')
          }
        };
      }),
    []
  );


  // We use favorites only to check if it includes some element,
  // so Object is better than array for that because hashmap access is O(1).
  const favoritesMap = useMemo(
    () => Object.fromEntries(favorites.map((x) => [x, true])),
    [favorites]
  );

  const accountsMap = useMemo(
    () => allAccounts
      .map((address, index): Omit<SortedAccount, 'account'> & { account: KeyringAddress | undefined } => {
        const deleg = delegations && delegations[index]?.isDelegating && delegations[index]?.asDelegating;
        const delegation: Delegation | undefined = (deleg && {
          accountDelegated: deleg.target.toString(),
          amount: deleg.balance,
          conviction: deleg.conviction
        }) || undefined;

        return {
          account: keyring.getAccount(address),
          address,
          delegation,
          isFavorite: favoritesMap[address ?? ''] ?? false
        };
      })
      .filter((a): a is SortedAccount => !!a.account)
      .reduce((ret: Record<string, SortedAccount>, x) => {
        ret[x.address] = x;

        return ret;
      }, {}),
    [allAccounts, favoritesMap, delegations]
  );

  const header = useMemo(
    (): Record<GroupName, [React.ReactNode?, string?, number?, (() => void)?][]> => {
      const ret: Record<GroupName, [React.ReactNode?, string?, number?, (() => void)?][]> = {
        injected: [[<>{t('extension')}<div className='sub'>{t('accounts available via browser extensions')}</div></>]],
        testing: [[<>{t('Accounts')}<div className='sub'>{t('')}</div></>]]
      };

      Object.values(ret).forEach((a): void => {
        a[0][1] = 'start';
        a[0][2] = 4;
      });

      return ret;
    },
    [t]
  );

  const grouped = useMemo(
    () => groupAccounts(sortedAccounts),
    [sortedAccounts]
  );

  const accounts = useMemo(
    () => Object.values(accountsMap).reduce<Record<string, React.ReactNode>>((all, { account, address, delegation, isFavorite }, index) => {
      all[address] = (
        <Account
          account={account}
          delegation={delegation}
          filter={filterOn}
          isFavorite={isFavorite}
          key={address}
          proxy={proxies?.[index]}
          setBalance={setBalance}
          toggleFavorite={toggleFavorite}
        />
      );

      return all;
    }, {}),
    [accountsMap, filterOn, proxies, setBalance, toggleFavorite]
  );

  const groups = useMemo(
    () => GROUP_ORDER.reduce<Record<string, React.ReactNode[]>>((groups, group) => {
      const items = grouped[group];

      if (items.length) {
        groups[group] = items.map((account) => accounts[account]);
      }

      return groups;
    }, {}),
    [grouped, accounts]
  );

  useEffect((): void => {
    setSorted((prev) => [
      ...prev
        .map((x) => accountsMap[x.address])
        .filter((x): x is SortedAccount => !!x),
      ...Object
        .keys(accountsMap)
        .filter((a) => !prev.find((y) => a === y.address))
        .map((a) => accountsMap[a])
    ]);
  }, [accountsMap]);

  useEffect((): void => {
    setSorted((sortedAccounts) =>
      sortAccounts(sortedAccounts, accountsMap, balances.accounts, sortBy, sortFromMax));
  }, [accountsMap, balances, sortBy, sortFromMax]);

  return (
    <StyledDiv className={className}>
      {isCreateOpen && (
        <CreateModal
          onClose={toggleCreate}
          onStatusChange={onStatusChange}
        />
      )}
      {isImportOpen && (
        <ImportModal
          onClose={toggleImport}
          onStatusChange={onStatusChange}
        />
      )}
      {isLedgerOpen && (
        <Ledger onClose={toggleLedger} />
      )}
      {isLocalOpen && (
        <Local
          onClose={toggleLocal}
          onStatusChange={onStatusChange}
        />
      )}
      {isMultisigOpen && (
        <Multisig
          onClose={toggleMultisig}
          onStatusChange={onStatusChange}
        />
      )}
      {isProxyOpen && (
        <Proxy
          onClose={toggleProxy}
          onStatusChange={onStatusChange}
        />
      )}
      {isQrOpen && (
        <Qr
          onClose={toggleQr}
          onStatusChange={onStatusChange}
        />
      )}
      {/* <BannerExtension /> */}
      <BannerClaims />
      {!isNextTick || !sortedAccounts.length
        ? (
          <MultisigTable
            empty={isNextTick && sortedAccounts && t("You don't have any accounts. Some features are currently hidden and will only become available once you have accounts.")}
          />
        )
        : GROUP_ORDER.map((group) =>
          groups[group] && (
            <MultisigTable
              empty={t('No accounts')}
              header={header[group]}
              isSplit
              key={group}
            >
              {groups[group]}
            </MultisigTable>
          )
        )
      }
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  .ui--Dropdown {
    width: 15rem;
  }
  margin-top: 1rem;
  .header-box {
    .dropdown-section {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .ui--Button-Group {
      margin-left: auto;
    }
  }
`;

export default React.memo(Overview);
