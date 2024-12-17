import {useSnapshot} from 'valtio';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Image, Text, Alert} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';
import {ChainAbstractionTypes} from '@reown/walletkit';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import {walletKit} from '@/utils/WalletKitUtil';
import {handleRedirect} from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import {EIP155_CHAINS, PresetsUtil} from '@/utils/PresetsUtil';
import {RequestModalV2} from './RequestModalV2/RequestModalV2';
import {BridgeBadge} from '@/components/BridgeBadge';
import {
  calculateEip155Gas,
  getNonce,
  getTransferDetails,
} from '@/utils/EIP155WalletUtil';
import {isVerified} from '@/utils/HelperUtil';
import {VerifiedDomain} from '@/components/VerifiedDomain';
import {Loader} from '@/components/Loader';
import {ethers} from 'ethers';

export default function SessionSendTransactionModal() {
  const {data} = useSnapshot(ModalStore.state);
  const [payingAmount, setPayingAmount] = useState('');
  const [bridgingTransactions, setBridgingTransactions] =
    useState<ChainAbstractionTypes.Transaction[]>();
  const [fundingFrom, setFundingFrom] =
    useState<
      {symbol: string; chainId: string; amount: string; tokenContract: string}[]
    >();
  const [networkFee, setNetworkFee] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [fetchingGas, setFetchingGas] = useState(false);
  const [fetchingTransferAmount, setFetchingTransferAmount] = useState(false);
  const [routingStatus, setRoutingStatus] = useState('');
  const [hasError, setHasError] = useState(false);

  // Get request and wallet data from store
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;

  const topic = requestEvent?.topic;
  const params = requestEvent?.params;
  const chainId = params?.chainId as string;
  const request = params?.request;
  const [transaction, setTransaction] = useState<any>(request?.params[0]);
  const isLinkMode = session?.transportType === 'link_mode';
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  const chainData = useMemo(() => {
    if (!chainId) {
      return;
    }
    const id = chainId.split(':')[1];
    const chain = PresetsUtil.getChainData(id);
    const logoSource = PresetsUtil.getChainLogo(id);
    return {
      data: chain,
      logo: logoSource ? (
        <Image source={logoSource} style={styles.chainLogo} />
      ) : null,
    };
  }, [chainId]);

  useEffect(() => {
    const value = transaction.value;
    if (value > 0) {
      setPayingAmount(`${value} ETH`);
      return;
    }
    setFetchingTransferAmount(true);
    getTransferDetails(transaction.data, transaction.to, chainId)
      .then(details => {
        console.log('details', details);
        setPayingAmount(`${details?.amount} ${details?.symbol}`);
      })
      .finally(() => {
        setFetchingTransferAmount(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateInitialTxFees = async () => {
    if (networkFee) {
      console.log('fees already updated');
      return;
    }
    setFetchingGas(true);
    console.log('calculating fees..');
    const fees = await calculateEip155Gas(transaction, chainId!);
    console.log('fees', fees);
    if (!fees) {
      console.log('fees not available');
      return;
    }

    setTransaction({
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      nonce: await getNonce(transaction.from, chainId),
      value: transaction.value || '0',
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      gasLimit: fees.gasLimit,
    });
    console.log('fees updated', fees);
    setNetworkFee(`${ethers.utils.formatEther(fees.gasLimit)} ETH`);
    setFetchingGas(false);
  };

  useMemo(async () => {
    if (fundingFrom) {
      return;
    }
    setFetchingRoutes(true);
    setFetchingGas(true);
    console.log('fetching routes...');
    const result = await walletKit.canFulfil({
      transaction: {
        from: transaction.from,
        to: transaction.to,
        data: transaction.data,
        nonce: '1',
        gas: '0',
        gasPrice: '0',
        value: '0',
        maxFeePerGas: '0',
        maxPriorityFeePerGas: '0',
        chainId: chainId,
      },
    });
    console.log('routes done');
    if (result.status === 'error') {
      setRoutingStatus(`Error: ${result.reason}`);
      setHasError(true);
    } else if (result.status === 'available') {
      const data = result.data;
      const routes = data.routes;

      console.log('ui fields', JSON.stringify(data.routesDetails, null, 2));
      const uiFields = data.routesDetails;

      const transactions: any[] = [];
      for (const tx of routes.transactions) {
        const txData = {
          ...tx,
          gasLimit: tx.gas,
          ...(await calculateEip155Gas(tx, tx.chainId)),
        };
        delete txData.gas;
        delete txData.gasPrice;
        transactions.push(txData);
      }

      console.log('bridging txs', JSON.stringify(transactions, null, 2));

      setNetworkFee(
        `${uiFields.totalFees.formattedAlt} ${uiFields.totalFees.symbol}`,
      );
      const txData = {
        ...transaction,
        ...(await calculateEip155Gas(transaction, chainId)),
      };
      delete txData.gas;
      delete txData.gasPrice;

      setTransaction({
        ...txData,
        nonce: await getNonce(transaction.from, chainId),
      });

      setBridgingTransactions(transactions);
      setFundingFrom(routes.funding);
    } else {
      setRoutingStatus(result.status);
      await calculateInitialTxFees();
    }

    setFetchingRoutes(false);
    setFetchingGas(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent && topic) {
      console.log('on Approve');
      try {
        setApproveLoading(true);
        const txs = bridgingTransactions?.length
          ? [...bridgingTransactions, transaction]
          : [];
        if (txs?.length) {
          console.log('txs', txs.length);
        }

        const response = await approveEIP155Request(requestEvent, txs);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        Alert.alert((e as Error).message);
        setApproveLoading(false);
        return;
      }

      setApproveLoading(false);
      ModalStore.close();
    }
  }, [
    requestEvent,
    topic,
    bridgingTransactions,
    peerMetadata?.redirect,
    isLinkMode,
    transaction,
  ]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent && topic) {
      setRejectLoading(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      } finally {
        setRejectLoading(false);
      }
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  const calculateUsdc = (amount: string) => {
    console.log(
      'amount',
      amount,
      parseInt(amount, 16),
      parseInt(amount, 16) / 10 ** 6,
    );
    return parseInt(amount, 16) / 10 ** 6;
  };

  const getChain = (chain: string) => {
    const parsedChain = chain?.includes(':') ? chain.split(':')[1] : chain;
    const logoSource = PresetsUtil.getChainLogo(parsedChain);
    console.log('chain', EIP155_CHAINS[parsedChain]);
    return {
      data: EIP155_CHAINS[parsedChain],
      logo: logoSource ? (
        <Image source={logoSource} style={styles.chainLogo} />
      ) : null,
    };
  };

  const FundingFromUi = useMemo(() => {
    if (!fundingFrom) {
      return (
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.iconColumn}>
              <BridgeBadge />
              <Text style={[styles.textMuted, styles.textSm]}>Bridging</Text>
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.alignInCenter}>
              <Text style={[styles.textMuted, styles.textSm]}>
                {fetchingRoutes ? (
                  <Loader loading={fetchingRoutes} />
                ) : (
                  routingStatus
                )}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    return fundingFrom?.map((funding, index) => {
      const fundingChainDetails = getChain(funding.chainId);
      return (
        <View style={styles.row} key={`funding_${index}`}>
          <View style={styles.column}>
            <View style={styles.iconColumn}>
              <BridgeBadge />
              <Text style={[styles.textMuted, styles.textSm]}>Bridging</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={[styles.textMain, styles.textSm]}>
              {calculateUsdc(funding.amount).toFixed(2)} {funding.symbol}
            </Text>
            <View style={styles.alignInCenter}>
              <Text style={[styles.textMuted, styles.textSm]}>
                From {fundingChainDetails?.data?.name}{' '}
              </Text>
              {fundingChainDetails?.logo}
            </View>
          </View>
        </View>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchingRoutes, fundingFrom]);

  return (
    <RequestModalV2
      heading="Review Transaction"
      onReject={onReject}
      onApprove={onApprove}
      approveLoader={approveLoading}
      rejectLoader={rejectLoading}
      disableApprove={
        fetchingGas || fetchingRoutes || fetchingTransferAmount || hasError
      }>
      <View style={styles.section}>
        <View style={styles.row}>
          {/* Left Column in Row */}
          <View style={styles.column}>
            <Text style={[styles.textMuted, styles.textMid]}>Paying</Text>
          </View>
          {/* Right Column in Row */}
          <View style={styles.column}>
            <Text style={[styles.textMain, styles.textMid]}>
              {payingAmount ? (
                payingAmount
              ) : (
                <Loader loading={fetchingTransferAmount} />
              )}
            </Text>
          </View>
        </View>
        <View style={[styles.innerSection]}>
          <View style={styles.row}>
            {/* Left Column in Row */}
            <View style={styles.column}>
              <Text style={[styles.textMuted, styles.textMid]}>
                Source of funds
              </Text>
            </View>
            {/* Right Column in Row */}
            <View style={styles.column} />
          </View>
          {FundingFromUi}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          {/* Left Column in Row */}
          <View style={styles.column}>
            <Text style={[styles.textMuted, styles.textMid]}>App</Text>
          </View>
          {/* Right Column in Row */}
          <View style={[styles.column, styles.alignInCenter]}>
            {isVerified(requestEvent?.verifyContext) ? (
              <VerifiedDomain />
            ) : null}
            <Text style={[styles.textMuted, styles.textSm]}>
              {peerMetadata?.url}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          {/* Left Column in Row */}
          <View style={styles.column}>
            <Text style={[styles.textMuted, styles.textMid]}>Network</Text>
          </View>
          {/* Right Column in Row */}
          <View style={styles.column}>
            <Text style={[styles.textMain, styles.textMid]}>
              {chainData?.logo} {chainData?.data.name}
            </Text>
          </View>
        </View>
        <View style={[styles.innerSection]}>
          <View style={styles.row}>
            {/* Left Column in Row */}
            <View style={styles.column}>
              <Text style={[styles.textMuted, styles.textMid]}>
                Estimated Fees
              </Text>
            </View>
            {/* Right Column in Row */}
            <View style={styles.column}>
              <Text style={[styles.textMain, styles.textMid]}>
                {networkFee ? networkFee : <Loader loading={fetchingGas} />}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </RequestModalV2>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 16,
    rowGap: 8,
  },
  section: {
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: 20,
    display: 'flex',
    padding: 5,
    marginBottom: 10,
  },
  innerSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
  },
  alignInCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    paddingLeft: 20,
    paddingEnd: 20,
  },
  chainLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  column: {
    alignItems: 'center',
  },
  iconColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textMuted: {
    color: '#9A9A9A',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 16,
    textAlign: 'left',
  },
  textMid: {
    fontSize: 14,
    lineHeight: 16,
  },
  textSm: {
    fontSize: 12,
    lineHeight: 14,
  },
  textMain: {
    color: '#ffffff',
    fontWeight: 500,
    textAlign: 'right',
  },
});
