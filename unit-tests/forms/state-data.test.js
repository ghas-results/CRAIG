const {
  getTierSubnets,
  getSubnetTierStateData,
} = require("../../client/src/lib/forms/state-data");
const { newDefaultVpcs } = require("../../client/src/lib/state/defaults");
const { assert } = require("chai");

describe("state data", () => {
  describe("getSubnetTiers", () => {
    it("should return subnets from list", () => {
      let actualData = getTierSubnets(
        { name: "vsi", zones: 3 },
        newDefaultVpcs()[0]
      )({ zones: 2 });
      let expectedData = [
        {
          acl_name: "management",
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
        {
          acl_name: "management",
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true,
        },
      ];
      assert.deepEqual(actualData, expectedData, "it should return vpcs");
    });
  });
  describe("getSubnetTierStateData", () => {
    it("should return subnets from list", () => {
      let actualData = getSubnetTierStateData(
        { name: "vsi", zones: 3 },
        newDefaultVpcs()[0]
      );
      let expectedData = {
        hide: true,
        networkAcl: "management",
        addPublicGateway: false,
        name: "vsi",
        zones: 3,
      };
      assert.deepEqual(actualData, expectedData, "it should return vpcs");
    });
    it("should return subnets from list where vpc", () => {
      let vpc = newDefaultVpcs()[0];
      vpc.subnets.forEach((subnet) => {
        subnet.public_gateway = true;
      });
      let actualData = getSubnetTierStateData({ name: "vsi", zones: 3 }, vpc);
      let expectedData = {
        hide: true,
        networkAcl: "management",
        addPublicGateway: true,
        name: "vsi",
        zones: 3,
      };
      assert.deepEqual(actualData, expectedData, "it should return vpcs");
    });
  });
});