import React from "react";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  HeaderMenuButton,
  Modal,
  Theme
} from "@carbon/react";
import { Reset, Download, Code, CodeHide } from "@carbon/icons-react";
import PropTypes from "prop-types";
import LeftNav from "./LeftNav";

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileDownloadUrl: "",
      showModal: false,
      expanded: false
    };
    this.resetState = this.resetState.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onModalShow = this.onModalShow.bind(this);
    this.onHamburgerClick = this.onHamburgerClick.bind(this);
  }
  // Reset state and redirect to home page
  resetState() {
    alert("reset state");
    window.location.href = "/";
  }

  onModalClose = () => {
    this.setState({ showModal: false });
  };

  onModalShow = () => {
    this.setState({ showModal: true });
  };

  onHamburgerClick() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    return (
      <Theme theme="g10">
        <Header aria-label="IBM Platform Name">
          <HeaderMenuButton
            aria-label="Open menu"
            isCollapsible
            onClick={this.onHamburgerClick}
            isActive={this.state.expanded}
          />
          <HeaderName href="/" prefix="">
            CRAIG
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label={
                this.props.hideCodeMirror
                  ? "Show Code Mirror Pane"
                  : "Hide Code Mirror Pane"
              }
              isActive
              onClick={() => this.props.onJsonToggle()}
              tooltipAlignment="end"
            >
              {this.props.hideCodeMirror ? <Code /> : <CodeHide />}
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Download Environment Terraform"
              isActive
              onClick={() => alert("Download goes here")}
              tooltipAlignment="end"
            >
              <Download />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Reset State"
              isActive
              onClick={this.onModalShow}
              tooltipAlignment="end"
            >
              <Reset />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <LeftNav
            expanded={this.state.expanded}
            onOverlayClick={this.onHamburgerClick}
            navCategories={this.props.navCategories}
          />
          {this.state.showModal && (
            <Modal
              modalHeading="Reset state"
              open={this.state.showModal}
              onRequestSubmit={this.resetState}
              onRequestClose={this.onModalClose}
              primaryButtonText="Reset"
              secondaryButtonText="Cancel"
              size="xs"
              danger={true}
              className="hard-left"
            >
              <p>
                Are you sure you want to reset state data? Clicking reset will
                remove any and all changes you have made.
              </p>
            </Modal>
          )}
        </Header>
      </Theme>
    );
  }
}

Navigation.defaultProps = {
  hideCodeMirror: false
};

Navigation.propTypes = {
  onJsonToggle: PropTypes.func.isRequired,
  hideCodeMirror: PropTypes.bool.isRequired,
  navCategories: PropTypes.array.isRequired
};

export default Navigation;
