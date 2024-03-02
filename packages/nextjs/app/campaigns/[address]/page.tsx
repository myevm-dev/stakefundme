"use client";

// import Link from "next/link";
import { formatUnits } from "viem";
import { useContractRead } from "wagmi";
import ProjectABI from "~~/app/campaigns/ProjectABI.json";
import { CreateCampaign } from "~~/components/fundguys/CreateCampaign";
import { TokenSymbol } from "~~/components/fundguys/TokenSymbol";

export default function CampaignDetailsPage({ params }: { params: { address: string } }) {
  const { data: projectData = [], isLoading } = useContractRead({
    address: params.address,
    abi: ProjectABI,
    functionName: "getProject",
  });

  if (isLoading) return <div>Loading...</div>;

  const [title, description, image, projectTokenAddress, targetAmount, amountRaised, deadline] = projectData as any;

  const percentageBigInt = (amountRaised || 0n * BigInt(100)) / (targetAmount || 1n);

  const deadlineDate = new Date(Number(deadline) * 1000);

  const handleShare = () => {
    const text = `Take a moment to hear about ${title} story from the Fund Guys Community 🍄`;
    const url = `https://fund-guys.vercel.app/campaigns/${params.address}`;
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(
      url,
    )}`;

    window.open(warpcastUrl, "_blank");
  };

  return (
    <>
      <div className="px-5 sm:px-7 md:px-20 my-10">
        <h3 className="text-7xl text-center font-madimi mb-10">Campaign Details</h3>

        <div>
          <img src={image} alt={title} className="w-full h-96 overflow-hidden object-cover rounded-lg mb-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <button onClick={handleShare} className="btn btn-primary w-full font-cubano font-normal text-xl">
            Share
          </button>
          <button className="btn-accent btn w-full font-cubano font-normal text-xl">Donate</button>
        </div>
        <div className="overflow-x-auto border border-white rounded-lg">
          <table className="table ">
            <tbody className="text-xl">
              <tr>
                <th className="border-r border-b border-white">Title</th>
                <td className="border-b">{title}</td>
              </tr>
              <tr>
                <th className="border-r border-b border-white">Description</th>
                <td className="border-b">{description}</td>
              </tr>
              <tr>
                <th className="border-r border-b border-white">Fundraising</th>
                <td className="border-b">
                  {Number(formatUnits(amountRaised || "", 18)).toFixed(2)} / {formatUnits(targetAmount || "", 18)}{" "}
                  <TokenSymbol tokenAddress={projectTokenAddress} />
                </td>
              </tr>
              <tr>
                <th className="border-r border-b border-white">Deadline</th>
                <td className="border-b">{deadlineDate.toDateString()}</td>
              </tr>
            </tbody>
          </table>
          bu
        </div>
      </div>
    </>
  );
}