"use client";

// import Link from "next/link";
import type { NextPage } from "next";
import { CampaignCard } from "~~/components/fundguys/CampaignCard";
import { CreateCampaign } from "~~/components/fundguys/CreateCampaign";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Subscription: NextPage = () => {
  const { data, isLoading } = useScaffoldEventHistory({
    contractName: "PublicGoodsFunding",
    eventName: "ProjectCreated",
    fromBlock: 0n, // can be set to the block in which we deploy on Base
  });
  return (
    <>
      <div className="px-5 sm:px-7 md:px-20 my-10">
        <h3 className="text-7xl text-center font-montserrat-classic text-blue-600">Subscription Stake</h3>
        <p className="text-center text-2xl my-10">
          Browse all active campaigns to find a cause you want to support or <CreateCampaign />
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading &&
            Array.from(Array(6).keys()).map((_, idx) => (
              <div key={idx} className="skeleton animate-pulse bg-base-100 rounded-xl w-full h-72"></div>
            ))}
          {data &&
            data
              ?.filter(
                (event: any) =>
                  event.args.projectAddress.toLowerCase() !==
                  "0xb094a3ca0183ac648c2ae0672732f653c8651688".toLowerCase(),
              )
              .map(({ args: { projectAddress } }) => (
                <CampaignCard key={projectAddress} contractAddress={projectAddress} isProfilePage={false} />
              ))}
        </div>
      </div>
    </>
  );
};

export default Subscription;
