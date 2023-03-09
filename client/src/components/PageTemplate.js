import React from "react";
import Footer from "./page-template/Footer";
import {
  IbmCloudKeyProtect,
  ObjectStorage,
  VirtualPrivateCloud,
  SubnetAclRules,
  IbmCloudSubnets,
  IbmCloudTransitGateway,
  Security,
  IbmCloudVpcEndpoints,
  CloudAuditing,
  Password,
  BareMetalServer_02,
  IbmCloudKubernetesService,
  CloudApp,
  GatewayVpn,
  BastionHost,
  IdManagement,
  GroupAccess,
  GroupResource,
  IbmCloudSecretsManager,
  IbmCloudSecurityComplianceCenter,
  IbmCloudEventStreams,
  LoadBalancerVpc,
  Report
} from "@carbon/icons-react";
import f5 from "../images/f5.png";
import Navigation from "./page-template/Navigation";
import { arraySplatIndex, getObjectFromArray, prettyJSON } from "lazy-z";
import { CraigCodeMirror } from "./page-template/CodeMirror";
import PropTypes from "prop-types";
import "./page-template.css";
import {
  appidTf,
  atrackerTf,
  clusterTf,
  cosTf,
  eventStreamsTf,
  f5Tf,
  formatIamAccountSettings,
  kmsTf,
  lbTf,
  resourceGroupTf,
  sccTf,
  secretsManagerTf,
  sgTf,
  sshKeyTf,
  teleportTf,
  tgwTf,
  formatSubnet,
  vpeTf,
  vpnTf,
  vsiTf,
  iamTf,
  tfBlock,
  formatVpc,
  tfDone,
  formatAcl,
  formatAclRule,
  formatPgw
} from "../lib/json-to-iac";
function F5Icon() {
  return <img src={f5} />;
}

const navCategories = [
  {
    name: "Access",
    links: [
      {
        title: "Resource Groups",
        path: "/form/resourceGroups",
        icon: GroupResource,
        toTf: resourceGroupTf
      },
      {
        title: "Access Groups",
        path: "/form/accessGroups",
        icon: GroupAccess,
        optional: true,
        toTf: iamTf
      },
      {
        title: "IAM Account Settings",
        path: "/form/iamAccountSettings",
        icon: IdManagement,
        optional: true,
        toTf: formatIamAccountSettings
      }
    ]
  },
  {
    name: "Services",
    links: [
      {
        title: "Key Management",
        path: "/form/keyManagement",
        icon: IbmCloudKeyProtect,
        field: "key_management",
        toTf: kmsTf
      },
      {
        title: "Object Storage",
        path: "/form/objectStorage",
        icon: ObjectStorage,
        field: "cos",
        toTf: cosTf
      },
      {
        title: "Secrets Manager",
        path: "/form/secretsManager",
        icon: IbmCloudSecretsManager,
        field: "secrets_manager",
        toTf: secretsManagerTf
      },
      {
        title: "Activity Tracker",
        path: "/form/activityTracker",
        icon: CloudAuditing,
        field: "atracker",
        toTf: atrackerTf
      },
      {
        title: "Event Streams",
        path: "/form/eventStreams",
        icon: IbmCloudEventStreams,
        optional: true,
        field: "event_streams",
        toTf: config => {
          if (config.event_streams.length > 0) return eventStreamsTf(config);
          return "";
        }
      },
      {
        title: "App ID",
        path: "/form/appID",
        icon: CloudApp,
        optional: true,
        toTf: appidTf
      },
      {
        title: "Security Compliance Center",
        path: "/form/securityComplianceCenter",
        icon: IbmCloudSecurityComplianceCenter,
        optional: true,
        toTf: sccTf
      }
    ]
  },
  {
    name: "Network",
    links: [
      {
        title: "Virtual Private Clouds",
        path: "/form/vpcs",
        icon: VirtualPrivateCloud,
        toTf: config => {
          let tf = "";
          config.vpcs.forEach(vpc => {
            let blockData = formatVpc(vpc, config);
            vpc.public_gateways.forEach(gateway => {
              blockData += formatPgw(gateway, config);
            });
            tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
          });
          return tfDone(tf);
        }
      },
      {
        title: "VPC Access Control",
        path: "/form/nacls",
        icon: SubnetAclRules,
        toTf: config => {
          let tf = "";
          config.vpcs.forEach(vpc => {
            let blockData = "";
            vpc.acls.forEach(acl => {
              blockData += formatAcl(acl, config);
              acl.rules.forEach(rule => {
                blockData += formatAclRule(rule);
              });
            });
            tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
          });
          return tfDone(tf);
        }
      },
      {
        title: "VPC Subnets",
        path: "/form/subnets",
        icon: IbmCloudSubnets,
        toTf: config => {
          let tf = "";
          config.vpcs.forEach(vpc => {
            let blockData = "";
            vpc.subnets.forEach(subnet => {
              blockData += formatSubnet(subnet, config);
            });
            tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
          });
          return tfDone(tf);
        }
      },
      {
        title: "Transit Gateways",
        path: "/form/transitGateways",
        icon: IbmCloudTransitGateway,
        toTf: tgwTf
      },
      {
        title: "Security Groups",
        path: "/form/securityGroups",
        icon: Security,
        toTf: sgTf
      },
      {
        title: "Virtual Private Endpoints",
        path: "/form/vpe",
        icon: IbmCloudVpcEndpoints,
        toTf: vpeTf
      },
      {
        title: "VPN Gateways",
        path: "/form/vpn",
        icon: GatewayVpn,
        toTf: vpnTf
      }
    ]
  },
  {
    name: "Clusters",
    links: [
      {
        title: "Clusters",
        path: "/form/clusters",
        icon: IbmCloudKubernetesService,
        toTf: clusterTf
      }
    ]
  },
  {
    name: "Virtual Servers",
    links: [
      {
        title: "SSH Keys",
        path: "/form/sshKeys",
        icon: Password,
        toTf: sshKeyTf
      },
      {
        title: "Virtual Server Instances",
        path: "/form/vsi",
        icon: BareMetalServer_02,
        toTf: vsiTf
      },
      {
        title: "Load Balancers",
        path: "/form/loadBalancers",
        icon: LoadBalancerVpc,
        toTf: lbTf
      },
      {
        title: "Teleport Bastion Host",
        path: "/form/teleport",
        icon: BastionHost,
        toTf: teleportTf
      },
      { title: "F5 Big IP", path: "/form/f5BigIP", icon: F5Icon, toTf: f5Tf }
    ]
  },
  {
    name: "Final Steps",
    links: [
      {
        title: "Summary",
        path: "/summary",
        icon: Report
      }
    ]
  }
];

let pageOrder = [
  {
    title: "Options",
    path: "/"
  }
];
// for each nav category
navCategories.forEach(category => {
  // for each link
  category.links.forEach(link => {
    // add the title and path to path order
    pageOrder.push(link);
  });
});
pageOrder.push({
  title: "Summary",
  path: "/summary"
});

const PageTemplate = props => {
  /**
   * Footer navigation function
   * @param {boolean} isBackward goes back
   * @returns {{title: string, onClick:Function}} title for page, on click function to navigate to that page
   */
  function navigate(isBackward) {
    let currentPath = window.location.pathname;
    let nextPathIndex = isBackward // get next path based on direction
      ? arraySplatIndex(pageOrder, "path", currentPath) - 1
      : arraySplatIndex(pageOrder, "path", currentPath) + 1;

    /**
     * function to send user to next path
     */
    function onClick() {
      props.nav(pageOrder[nextPathIndex].path);
    }

    return nextPathIndex === pageOrder.length || nextPathIndex === -1
      ? {
          // if next index is out of bounds of array, send empty string
          // and no onclick function
          title: ""
        }
      : {
          title: pageOrder[nextPathIndex].title,
          onClick: onClick
        };
  }

  /**
   * get code mirror display
   * @param {string} form name of form
   * @param {Object} json craig config json
   * @returns {string} code to display
   */
  function getCodeMirrorDisplay(form, json) {
    let prettyCraigJson = prettyJSON(json);
    if (!form) return prettyCraigJson;
    let pageObj = getObjectFromArray(pageOrder, "path", `/form/${form}`);
    if (pageObj.toTf) {
      return pageObj.toTf(json);
    } else return prettyCraigJson;
  }

  return (
    <>
      <Navigation
        hideCodeMirror={props.hideCodeMirror}
        onJsonToggle={() => props.toggleHide("hideCodeMirror")}
        navCategories={navCategories}
      />
      <div className="minHeight displayFlex navBarAlign boxShadow fieldPadding">
        <div className={props.hideCodeMirror ? "" : "leftPanelWidth"}>
          {props.children}
        </div>
        <CraigCodeMirror
          hideCodeMirror={props.hideCodeMirror}
          code={getCodeMirrorDisplay(props.form, props.json)}
        />
      </div>
      <Footer
        toggleFooter={() => props.toggleHide("hideFooter")}
        hideFooter={props.hideFooter}
        navigate={navigate}
      />
    </>
  );
};

PageTemplate.defaultProps = {
  hideFooter: false,
  hideCodeMirror: false
};

PageTemplate.propTypes = {
  code: PropTypes.string, // can be null or undefined
  hideCodeMirror: PropTypes.bool.isRequired,
  hideFooter: PropTypes.bool.isRequired,
  toggleHide: PropTypes.func.isRequired
};

export default PageTemplate;