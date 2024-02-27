// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PublicGoodsFunding {
	struct Project {
		address payable projectOwner;
		address projectTokenAddress; // adding token address parameter
		string projectTitle;
		string projectDescription;
		string image;
		uint256 targetAmount;
		uint256 amountRaised;
		uint256 deadline;
		uint256 projectId;
		uint256[] contributions;
		address[] contributors;
		bool completed;
	}

	mapping(uint256 => Project) public projects;

	address public exchangeProxyContract;
	uint256 public projectCount = 0;

	modifier onlyOwner(uint256 _projectId) {
		require(
			msg.sender == projects[_projectId].projectOwner,
			"You are not project owner"
		);
		_;
	}

	constructor(address _exchangeProxy) {
		exchangeProxyContract = _exchangeProxy;
	}

	// create public goods project campaign
	function createProject(
		address _projectOwner,
		address _projectTokenAddress, // adding token address parameter
		string memory _projectTitle,
		string memory _projectDescription,
		uint256 _targetAmount,
		uint256 _deadline,
		string memory _image
	) public returns (uint256) {
		Project storage project = projects[projectCount];
		require(
			_deadline > block.timestamp,
			"Deadline must be set in the future"
		);
		_projectOwner = msg.sender;
		project.projectOwner = payable(_projectOwner);
		project.projectTokenAddress = _projectTokenAddress; // added token address to contract
		project.projectTitle = _projectTitle;
		project.projectDescription = _projectDescription;
		project.targetAmount = _targetAmount;
		project.deadline = _deadline;
		project.image = _image;
		project.amountRaised = 0;
		project.completed = false;

		project.projectId = projectCount;
		projectCount++;
		return projectCount;
	}

	// donate function (modified to include token address choice)
	function donateFunds(
		uint256 _projectId,
		address _selectedTokenAddress
	) public payable {
		Project storage project = projects[_projectId];
		require(msg.value > 0, "Contributions must be more than zero");
		require(project.completed == false, "Project is completed");

		if (_selectedTokenAddress == project.projectTokenAddress) {
			project.amountRaised += msg.value;
		} else {
			IERC20 token = IERC20(_selectedTokenAddress);
			// 0x exchange proxy as the spender
			uint256 allowance = token.allowance(
				msg.sender,
				exchangeProxyContract
			);
			require(allowance > 0, "Allowance must be more than zero");
			project.amountRaised += msg.value;
		}

		project.contributors.push(msg.sender);
		project.contributions.push(msg.value);
	}

	// withdraw funds
	function withdrawFunds(
		uint256 _projectId
	) public payable onlyOwner(_projectId) {
		Project storage project = projects[_projectId];
		require(
			project.amountRaised >= project.targetAmount ||
				block.timestamp >= project.deadline,
			"Project funding goals have not been reached"
		);
		(bool success, ) = msg.sender.call{ value: project.amountRaised }("");
		require(success, "Failed to withdraw funds");
		project.completed = true;
	}

	///////////////////////////////////////////
	/////////// GETTER FUNCTIONS //////////////
	///////////////////////////////////////////

	function getProjects() public view returns (Project[] memory) {
		Project[] memory allProjects = new Project[](projectCount);

		for (uint256 i = 0; i < projectCount; i++) {
			allProjects[i] = projects[i];
		}

		return allProjects;
	}

	function getContributors(
		uint256 _projectId
	) public view returns (address[] memory) {
		return projects[_projectId].contributors;
	}

	function getContributions(
		uint256 _projectId
	) public view returns (uint256[] memory) {
		return projects[_projectId].contributions;
	}
}
