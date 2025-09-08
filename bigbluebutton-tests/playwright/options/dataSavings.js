const { openSettings } = require('./util');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');
const { sleep } = require('../core/helpers');


class DataSavings extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async enableOtherParticipantsWebcams() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await sleep(500)
    await this.modPage.hasNElements('video', 2, 'should display 2 video elements for the moderator');
    await this.userPage.hasNElements('video', 2, 'should display 2 video elements for the attendee');

    await openSettings(this.modPage);
    await openSettings(this.userPage);
    await this.modPage.waitAndClick(e.dataSavingsTab);
    await this.userPage.waitAndClick(e.dataSavingsTab);
    await this.modPage.hasElementChecked(e.enableWebcamsToggleBtn, 'checked', 'should display the toggle button as ON');
    await this.userPage.waitAndClickElement(e.enableWebcamsToggleBtn);
    await this.userPage.hasElementNotChecked(e.enableWebcamsToggleBtn, 'unchecked', 'should display the toggle button as OFF');
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.modalConfirmButton);
    await sleep(500);

    await this.userPage.hasNElements('video', 1, 'should display 1 video elements for the attendee');
    await this.userPage.hasElement(e.webcamMirroredVideoContainer, 'should display the current user webcam for the attendee');
    await this.userPage.hasElement(e.videoDropdownMenu, 'should display the video dropdown menu');
    await this.modPage.hasNElements('video', 2, 'should display 2 video elements for the moderator');

    await this.modPage.waitAndClick(e.leaveVideo);
    await this.modPage.hasNElements('video', 1, 'should display 1 video element for the moderator');

    await this.modPage.shareWebcam();
    await this.modPage.hasNElements('video', 2, 'should display 2 video elements for the moderator');
    await this.userPage.hasNElements('video', 1, 'should display 1 video elements for the attendee');
    await this.userPage.hasElement(e.webcamMirroredVideoContainer, 'should display the current user webcam for the attendee');
  }

  async enableOtherParticipantsDesktopSharing() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await utilScreenShare.startScreenshare(this.modPage);
    await sleep(500);
    await this.modPage.hasElement(e.screenShareVideo, 'should display the screenshare for the moderator');
    await this.userPage.hasElement(e.screenShareVideo, 'should display the screenshare for the attendee');
    
    await openSettings(this.modPage);
    await openSettings(this.userPage);
    await this.modPage.waitAndClick(e.dataSavingsTab);
    await this.userPage.waitAndClick(e.dataSavingsTab);
    await this.modPage.hasElementChecked(e.enableDesktopSharingToggleBtn, 'checked', 'should display the toggle button as ON');
    await this.userPage.waitAndClickElement(e.enableDesktopSharingToggleBtn);
    await this.userPage.hasElementNotChecked(e.enableDesktopSharingToggleBtn, 'unchecked', 'should display the toggle button as OFF');
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.modalConfirmButton);
    await sleep(500);

    await this.userPage.wasRemoved(e.screenShareVideo, 'should not display the screenshare for the attendee');
    await this.modPage.hasElement(e.screenShareVideo, 'should display the screenshare for the moderator');
    
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.screenShareVideo, 'should not display the screenshare for the moderator');
    await this.userPage.wasRemoved(e.screenShareVideo, 'should not display the screenshare for the attendee');

    await utilScreenShare.startScreenshare(this.modPage);
    await sleep(500);
    await this.modPage.hasElement(e.screenShareVideo, 'should display the screenshare for the moderator');
    await this.userPage.wasRemoved(e.screenShareVideo, 'should not display the screenshare for the attendee');
  }
}

exports.DataSavings = DataSavings;
