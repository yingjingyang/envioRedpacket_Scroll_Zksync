/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  HappyRedPacketContract,
  ClaimEntity,
  RedpacketEntity,
  RefundEntity,
  LastupdateEntity,
  TokenEntity,
} from "generated";

import { GetClient } from "./utils/client";

const Erc20ABI = [
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
];


HappyRedPacketContract.ClaimSuccess.loader(({event,context}) => {
  context.Redpacket.load(event.params.id,undefined);
})

HappyRedPacketContract.ClaimSuccess.handler(({ event, context }) => {
  let claimID = event.transactionHash + event.logIndex

  const claimEntity: ClaimEntity = {
    id: claimID,
    happyRedPacketId: event.params.id,
    claimer: event.params.claimer,
    claimedValue: event.params.claimed_value,
    tokenAddress: event.params.token_address,
    lock: event.params.lock,
    blockNumber: BigInt(event.blockNumber),
    blockTimestamp: BigInt(event.blockTimestamp),
    transactionHash: event.transactionHash,
    redpacket_id: event.params.id,
  };

  let redpacket = context.Redpacket.get(event.params.id);
  if (redpacket == undefined) {
    return
  }
  
  let tempBigInt = redpacket.remainToClaim - BigInt(1)
  let checkAllClaimed = false
  if(tempBigInt == BigInt(0)){
    checkAllClaimed = true
  }

  context.Redpacket.set({
    id: event.params.id,
    total: redpacket.total,
    happyRedPacketId: redpacket.happyRedPacketId,
    name: redpacket.name,
    message: redpacket.message,
    creator: redpacket.creator,
    creationTime: redpacket.creationTime,
    tokenAddress: redpacket.tokenAddress,
    token_id: redpacket.token_id,
    number: redpacket.number,
    remainToClaim: redpacket.remainToClaim,
    ifrandom: redpacket.ifrandom,
    duration: redpacket.duration,
    lock: redpacket.lock,
    blockNumber: redpacket.blockNumber,
    blockTimestamp: redpacket.blockTimestamp,
    transactionHash: redpacket.transactionHash,
    expireTimestamp: redpacket.expireTimestamp,
    refunded: redpacket.refunded,
    refunder_id: redpacket.refunder_id,
    allClaimed: checkAllClaimed,
  });

  context.Lastupdate.set({
    id: "1",
    lastupdateTimestamp: BigInt(event.blockTimestamp),
  })

  context.Claim.set(claimEntity);
});

HappyRedPacketContract.CreationSuccess.loader(({event,context}) => {
  context.Redpacket.load(event.params.id,undefined);
  context.Token.load(event.params.token_address)
})


HappyRedPacketContract.CreationSuccess.handlerAsync(async ({ event, context }) => {
  context.Lastupdate.set({
    id: "1",
    lastupdateTimestamp: BigInt(event.blockTimestamp),
  })

  const redpacketEntity: RedpacketEntity = {
    id: event.params.id,
    total: event.params.total,
    happyRedPacketId: event.params.id,
    name: event.params.name,
    message: event.params.message,
    creator: event.params.creator,
    creationTime: event.params.creation_time,
    tokenAddress: event.params.token_address,
    token_id: event.params.token_address,
    number: event.params.number,
    remainToClaim: event.params.number,
    ifrandom: event.params.ifrandom,
    duration: event.params.duration,
    lock: event.params.lock,
    blockNumber: BigInt(event.blockNumber),
    blockTimestamp: BigInt(event.blockTimestamp),
    transactionHash: event.transactionHash,
    expireTimestamp: event.params.creation_time + event.params.duration,
    refunded: false,
    refunder_id: undefined,
    allClaimed: false,
  };

  let token = await context.Token.get(event.params.token_address);
  const chainId = event.chainId
  const eventId = `${chainId}-${event.params.id}`;

  if (token == null) {
    try{
      const client = GetClient(chainId);

      const tokenName = (await client.readContract({
        address: event.params.token_address as any,
        abi: Erc20ABI,
        functionName: "name",
        args: [],
      })) as string;

      const tokenSymbol = (await client.readContract({
        address: event.params.token_address as any,
        abi: Erc20ABI,
        functionName: "symbol",
        args: [],
      })) as string;

      const tokenDecimals = (await client.readContract({
        address: event.params.token_address as any,
        abi: Erc20ABI,
        functionName: "decimals",
        args: [],
      })) as number;
      // let tokenSymbol = 

      context.Token.set({
        id: event.params.token_address,
        address: event.params.token_address,
        symbol: tokenSymbol,
        name: tokenName,
        decimals: BigInt(tokenDecimals),
        chainID: BigInt(event.chainId),
      });

    }catch(error){
      context.log.error(
        `Unable to fetch token info ${event.params.token_address} | Record ${eventId}`
      );
    }
  }

  context.Redpacket.set(redpacketEntity)
});

HappyRedPacketContract.RefundSuccess.loader(({event,context}) => {
  context.Redpacket.load(event.params.id,undefined);
})

HappyRedPacketContract.RefundSuccess.handler(({ event, context }) => {
  let redpacket = context.Redpacket.get(event.params.id);
  if (redpacket == undefined) {
    return
  }

  let tempRefundId = event.transactionHash + event.logIndex

  context.Refund.set({
    id: tempRefundId,
    happyRedPacketId: event.params.id,
    tokenAddress: event.params.token_address,
    remainingBalance: event.params.remaining_balance,
    lock: event.params.lock,
    blockNumber: BigInt(event.blockNumber),
    blockTimestamp: BigInt(event.blockTimestamp),
    transactionHash: event.transactionHash,
  });

  context.Redpacket.set({
    ...redpacket,
    refunded: true,
    refunder_id: tempRefundId,
    allClaimed: redpacket.allClaimed,
  });

  context.Lastupdate.set({
    id: "1",
    lastupdateTimestamp: BigInt(event.blockTimestamp),
  })
});
