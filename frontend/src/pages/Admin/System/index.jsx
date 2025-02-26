import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import Admin from "@/models/admin";
import showToast from "@/utils/toast";
import { userFromStorage } from "@/utils/request";
import CTAButton from "@/components/lib/CTAButton";
import { getDownloadFileXML, getDownloadFilePDF } from "@/utils/downloadUtils";
import System from "../../../models/system";

export default function AdminSystem() {

  const [savingMsgLimit, setSavingMsgLimit] = useState(false);
  const [savingADFSSSOStep0, setSavingADFSSSOStep0] = useState(false);  // step0: switch off sso
  const [savingADFSSSOStep1, setSavingADFSSSOStep1] = useState(false);  // step1: generate config
  const [savingADFSSSOStep2, setSavingADFSSSOStep2] = useState(false);  // step2: validate config
  const [savingADFSSSOStep3, setSavingADFSSSOStep3] = useState(false);  // step3: convert to sso
  const [hasMsgLimitChanges, setHasMsgLimitChanges] = useState(false);
  const [hasSSOFlagSetTrue, setHasSSOFlagSetTrue] = useState(false);
  const [hasADFSSSOChanges, setHasADFSSSOChanges] = useState(false);
  const [hasADFSSSOChangesOnStep0, setHasADFSSSOChangesOnStep0] = useState(false);
  const [hasADFSSSOChangesOnStep1, setHasADFSSSOChangesOnStep1] = useState(false);
  const [hasADFSSSOChangesOnStep2, setHasADFSSSOChangesOnStep2] = useState(false);
  const [hasADFSSSOChangesOnStep3, setHasADFSSSOChangesOnStep3] = useState(false);
  const [messageLimit, setMessageLimit] = useState({
    enabled: false,
    limit: 10,
  });
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  const [configADFSSSO, setADFSSSOChanges] = useState({
    enabled: false,
    url: "https://adfs-server/adfs/ls/",
    issuer: "SAML 2.0 Issuer",
    callback: `${wsProtocol}//${window.location.host}`,
    configFile: "",
    state: -1,
  });

  const handleSubmitMsgLimit = async (e) => {
    e.preventDefault();
    setSavingMsgLimit(true);
    await Admin.updateSystemPreferences({
      limit_user_messages: messageLimit.enabled,
      message_limit: messageLimit.limit,
    });
    setSavingMsgLimit(false);
    setHasMsgLimitChanges(false);
    showToast("System preferences updated successfully for message limit.", "success");
  };

  const handleSubmitADFSSSOSetup = async (e) => {
    e.preventDefault();
  };

  const handleSubmitADFSSSOStep1 = async (e) => {
    setSavingADFSSSOStep1(true);
    // Set the state variables
    configADFSSSO.state = 1;
    const adfsConfig = (await Admin.validateSystemPreferencesSSO({
      enabled_adfs_sso: configADFSSSO.enabled,
      adfs_sso_url: configADFSSSO.url,
      adfs_sso_callback: configADFSSSO.callback,
      adfs_sso_issuer: configADFSSSO.issuer,
      adfs_sso_state: configADFSSSO.state,
    }))?.data;
    if (adfsConfig) {
      // Create a Blob from the XML content
      configADFSSSO.configFile = adfsConfig['adfsSettings'];
      getDownloadFileXML(configADFSSSO.configFile);
      setSavingADFSSSOStep1(false);
      setHasADFSSSOChangesOnStep0(false);
      setHasADFSSSOChangesOnStep1(false);
      setHasADFSSSOChangesOnStep2(true);
      setHasADFSSSOChangesOnStep3(false);
      setHasADFSSSOChanges(true);
      showToast("System preferences updated successfully for single sign-on.", "success");
    } else {
      // Handle the case where adfsConfig is not available
      configADFSSSO.state = -1;
      showToast("Failed to update system preferences.", "error");
    }
  };

  const handleSubmitADFSSSOStep2 = async (e) => {
    setSavingADFSSSOStep2(true);
    configADFSSSO.state = 2;
    const adfsConfig = (await Admin.validateSystemPreferencesSSO({
      enabled_adfs_sso: configADFSSSO.enabled,
      adfs_sso_url: configADFSSSO.url,
      adfs_sso_callback: configADFSSSO.callback,
      adfs_sso_issuer: configADFSSSO.issuer,
      adfs_sso_state: configADFSSSO.state,
    }))?.success;
    if (adfsConfig) {
      setSavingADFSSSOStep2(false);
      setHasADFSSSOChangesOnStep0(false);
      setHasADFSSSOChangesOnStep1(false);
      setHasADFSSSOChangesOnStep2(false);
      setHasADFSSSOChangesOnStep3(true);
      setHasADFSSSOChanges(true);
      showToast("System preferences updated successfully for single sign-on.", "success");
    } else {
      // Handle the case where adfsConfig is not available
      configADFSSSO.state = 1;
      showToast("Failed to validate system preferences.", "error");
    }
  };


  const handleSubmitADFSSSOStep3 = async (e) => {
    setSavingADFSSSOStep3(true);
    configADFSSSO.state = 3;
    const adfsConfig = await Admin.validateSystemPreferencesSSO({
      enabled_adfs_sso: configADFSSSO.enabled,
      adfs_sso_url: configADFSSSO.url,
      adfs_sso_callback: configADFSSSO.callback,
      adfs_sso_issuer: configADFSSSO.issuer,
      adfs_sso_state: configADFSSSO.state,
    });
    setSavingADFSSSOStep3(false);
    setHasADFSSSOChangesOnStep0(true);
    setHasADFSSSOChangesOnStep1(false);
    setHasADFSSSOChangesOnStep2(false);
    setHasADFSSSOChangesOnStep3(false);
    setHasADFSSSOChanges(false);
    if (configADFSSSO.enabled) {
      showToast("System preferences updated successfully for single sign-on.", "success");
    }
    else {
      configADFSSSO.state = 2;
      showToast("System preferences converted back to local login.", "success");
    }
  };

  const handleSubmitADFSSSOStep0 = async (e) => {
    setSavingADFSSSOStep0(true);
    configADFSSSO.state = -1;
    const adfsConfig = await Admin.validateSystemPreferencesSSO({
      enabled_adfs_sso: configADFSSSO.enabled,
      adfs_sso_url: configADFSSSO.url,
      adfs_sso_callback: configADFSSSO.callback,
      adfs_sso_issuer: configADFSSSO.issuer,
      adfs_sso_state: configADFSSSO.state,
    });
    setSavingADFSSSOStep0(false);
    setHasADFSSSOChangesOnStep1(true);
    setHasADFSSSOChangesOnStep1(false);
    setHasADFSSSOChangesOnStep2(false);
    setHasADFSSSOChangesOnStep3(false);
    setHasADFSSSOChanges(false);
    if (configADFSSSO.enabled) {
      showToast("System preferences updated successfully for single sign-on.", "success");
    }
    else {
      showToast("System preferences converted back to local login.", "success");
    }
  };

  function getButtonLabel(id, state, hasChanges) {

    if (id == 0) {
      switch (state) {
        case -1:
        case 3:
          return 'Save Changes';
        case 1:
          return hasChanges ? 'Convert back to local login' : 'Converting ...';
        default:
          return 'Not Defined';
      }
    }
    if (id == 1) {
      switch (state) {
        case -1:
        case 0:
          return hasChanges ? 'Generate Config' : 'Generating ...';
        case 1:
        case 2:
        case 3:
          return "Config is generated";
        default:
          return 'Not Defined';
      }
    }
    if (id == 2) {
    switch (state) {
        case -1:
        case 0:
          return "pending for validation...";
        case 1:
          return hasChanges ? 'Validate Config' : 'Validating ...';
        case 2:
        case 3:
          return 'Config is validated';
        default:
          return 'Not Defined';
      }
    }
    if (id == 3) {
      switch (state) {
        case -1:
        case 0:
        case 1:
          return "pending for convertion...";
        case 2:
          return hasChanges ? 'Convert to SSO' : 'Converting ...';
        case 3:
          return 'Converted to SSO';
        default:
          return 'Not Defined';
      }
    }
    if (id == 4) {
      switch (state) {
        case -1:
        case 0:
          return 'Pending for Configuration';
        case 1:
          return hasChanges ? 'Download Configuration Guide' : 'Downloading ...';
        case 2:
        case 3:
          return 'Config is validated';
        default:
          return 'Not Defined';
      }
    }
    return 'Not Defined';
  };

  function isAdminUser() {
    const user = userFromStorage();
    return user?.role === "admin"
  };

  async function setShowSSOPanel() {
    let sso_enabled = await System.checkSSOFlagSetTrue();
    setHasSSOFlagSetTrue(sso_enabled.ssoModeFlag);
  }

  useEffect(() => {
    async function fetchSettings() {
      const settings = (await Admin.systemPreferences())?.settings;
      if (!settings) return;

      // const state = Number(settings.adfs_sso_state);
      const state = settings.adfs_sso_state === '[]' ? -1 : Number(settings.adfs_sso_state);

      setMessageLimit({
        enabled: settings.limit_user_messages,
        limit: settings.message_limit,
      });

      setADFSSSOChanges({
        enabled: settings.enabled_adfs_sso,
        url: settings.adfs_sso_url,
        issuer: settings.adfs_sso_issuer,
        callback: settings.adfs_sso_callback,
        state: state,
      })

      await setShowSSOPanel();
    }
    fetchSettings();
  }, []);


  return (
    <div className="w-screen h-screen overflow-hidden bg-sidebar flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-main-gradient w-full h-full overflow-y-scroll"
      >
        <form
          onSubmit={handleSubmitMsgLimit}
          onChange={() => setHasMsgLimitChanges(true)}
          className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16"
        >
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white border-b-2 border-opacity-10">
            <div className="items-center">
              <p className="text-lg leading-6 font-bold text-white">
                System Preferences
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
              These are the overall settings and configurations of your
              instance.
            </p>
          </div>
          <div className="mt-4 mb-8">
            <div className="flex flex-col gap-y-1">
              <h2 className="text-base leading-6 font-bold text-white">
                Limit messages per user per day
              </h2>
              <p className="text-xs leading-[18px] font-base text-white/60">
                Restrict non-admin users to a number of successful queries or
                chats within a 24 hour window. Enable this to prevent users from
                running up OpenAI costs.
              </p>
              <div className="mt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="limit_user_messages"
                    value="yes"
                    checked={messageLimit.enabled}
                    onChange={(e) => {
                      setMessageLimit({
                        ...messageLimit,
                        enabled: e.target.checked,
                      });
                    }}
                    className="peer sr-only"
                  />
                  <div className="pointer-events-none peer h-6 w-11 rounded-full bg-stone-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border after:border-gray-600 after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-lime-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"></span>
                </label>
              </div>
            </div>
            {messageLimit.enabled && (
              <div className="mt-4">
                <label className="text-white text-sm font-semibold block mb-4">
                  Message limit per day
                </label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    name="message_limit"
                    onScroll={(e) => e.target.blur()}
                    onChange={(e) => {
                      setMessageLimit({
                        enabled: true,
                        limit: Number(e?.target?.value || 0),
                      });
                    }}
                    value={messageLimit.limit}
                    min={1}
                    max={300}
                    className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-60 p-2.5"
                  />
                </div>
              </div>
            )}
            {hasMsgLimitChanges && (
              <div className="flex justify-end">
                <CTAButton onClick={handleSubmitMsgLimit} className="mt-3 mr-0">
                  {savingMsgLimit ? "Saving..." : "Save changes"}
                </CTAButton>
              </div>
            )}
          </div>
        </form>
        {isAdminUser() && hasSSOFlagSetTrue &&
          (
            <form
              onSubmit={handleSubmitADFSSSOSetup}
              onChange={() => setHasADFSSSOChanges(true)}
              className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16"
            >
              <div className="mt-4 mb-8">
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-base leading-6 font-bold text-white">
                    Single Sign-On (SSO) Configuration
                  </h2>
                  <p className="text-xs leading-[18px] font-base text-white/60">
                    Set up Single Sign-On (SSO) with Active Directory Federation Services (ADFS) on SAML 2.0. <br />
                  </p>
                  <p className="text-xxs leading-[26px] font-base text-red-500">
                    You have to complete three steps one by one for ADFS SSO system setup. <br />
                  </p>
                  <p className="text-xs leading-[18px] font-base text-white/60">
                    Step 1: Generate Configuration File, please provide the entrypoint path of ADFS on SAML 2.0, and the system would generate SSO configuration file.<br />
                    Step 2: Validate ADFS SSO, your system administrator should upload the file generated and set up the ADFS accordingly.<br />
                    Step 3: Convert the system to SSO. Remember that once changed to SSO, it is non reversible.<br />
                  </p>
                  <div className="mt-2">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="enable_adfs_sso"
                        value="yes"
                        checked={configADFSSSO.enabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setADFSSSOChanges({
                              ...configADFSSSO,
                              enabled: true,
                            });
                            setHasADFSSSOChangesOnStep1(true);
                            setHasADFSSSOChangesOnStep2(false);
                            setHasADFSSSOChangesOnStep3(false);
                          }
                          else {
                            setADFSSSOChanges({
                              ...configADFSSSO,
                              enabled: false,
                              state: -1,
                            });
                            setHasADFSSSOChangesOnStep1(false);
                            setHasADFSSSOChangesOnStep2(false);
                            setHasADFSSSOChangesOnStep3(true);
                          }
                        }
                        }
                        className="peer sr-only"
                      />
                      <div className="pointer-events-none peer h-6 w-11 rounded-full bg-stone-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border after:border-gray-600 after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-lime-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"></span>
                    </label>
                  </div>
                </div>
                {configADFSSSO.enabled && (
                  <div className="mt-4">
                    <label className="text-white text-sm font-semibold block mb-4">
                      ADFS SAML Entrypoint Path
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        name="adfs_sso_url"
                        onChange={(e) => {
                          setADFSSSOChanges({
                            enabled: true,
                            url: String(e?.target?.value),
                            issuer: configADFSSSO.issuer,
                            callback: configADFSSSO.callback,
                            state: 0,
                          });
                        }}
                        value={configADFSSSO.url}
                        className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-60 p-2.5"
                      />
                    </div>
                    <br></br>
                    <label className="text-white text-sm font-semibold block mb-4">
                      ADFS SAML Issuer <br /> (e.g. anysearch.local)
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        name="adfs_sso_issuer"
                        onChange={(e) => {
                          setADFSSSOChanges({
                            enabled: true,
                            url: configADFSSSO.url,
                            issuer: String(e?.target?.value),
                            callback: configADFSSSO.callback,
                            state: 0,
                          });
                        }}
                        value={configADFSSSO.issuer}
                        className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-60 p-2.5"
                      />
                    </div>
                    <br></br>
                    <label className="text-white text-sm font-semibold block mb-4">
                      Callback Host with Port <br /> (e.g. https://currentsite.local:3001)
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        name="adfs_sso_callback"
                        onChange={(e) => {
                          setADFSSSOChanges({
                            enabled: true,
                            url: configADFSSSO.url,
                            issuer: configADFSSSO.issuer,
                            callback: String(e?.target?.value),
                            state: 0,
                          });
                        }}
                        value={configADFSSSO.callback}
                        className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:border-white block w-60 p-2.5"
                      />
                    </div>
                    <br></br>
                    <div className="relative mt-2">
                      <label className="text-white text-sm font-semibold block mb-4">Download and Config at ADFS</label>
                      <CTAButton
                        onClick={(e) => {
                          getDownloadFilePDF("/docs/adfs-setup.pdf")
                        }}
                        disabled={!hasADFSSSOChangesOnStep2}
                        className={`mt-3 mr-3 ${!hasADFSSSOChangesOnStep2 ? 'bg-secondary' : ''}`}
                      >
                        {getButtonLabel(4, configADFSSSO.state, hasADFSSSOChangesOnStep2)}
                      </CTAButton>
                    </div>
                  </div>
                )}
                {configADFSSSO.enabled && (
                  <div className="flex justify-end">
                    <CTAButton
                      onClick={(e) => {
                        handleSubmitADFSSSOStep1();
                      }}
                      disabled={!hasADFSSSOChangesOnStep1}
                      className={`mt-3 mr-3 ${!hasADFSSSOChangesOnStep1 ? 'bg-secondary' : ''}`}>
                      {getButtonLabel(1, configADFSSSO.state, hasADFSSSOChangesOnStep1)}
                    </CTAButton>
                    <CTAButton
                      onClick={(e) => {
                        handleSubmitADFSSSOStep2();
                      }}
                      disabled={!hasADFSSSOChangesOnStep2}
                      className={`mt-3 mr-3 ${!hasADFSSSOChangesOnStep2 ? 'bg-secondary' : ''}`}>
                      {getButtonLabel(2, configADFSSSO.state, hasADFSSSOChangesOnStep2)}
                    </CTAButton>
                    <CTAButton
                      onClick={(e) => {
                        handleSubmitADFSSSOStep3();
                      }}
                      disabled={!hasADFSSSOChangesOnStep3}
                      className={`mt-3 mr-3 ${!hasADFSSSOChangesOnStep3 ? 'bg-secondary' : ''}`}>
                      {getButtonLabel(3, configADFSSSO.state, hasADFSSSOChangesOnStep3)}
                    </CTAButton>
                  </div>
                )}
                {!configADFSSSO.enabled && (
                  <div className="flex justify-end">
                    <CTAButton
                      onClick={(e) => {
                        handleSubmitADFSSSOStep0();
                      }}
                      className={`mt-3 mr-3`}>
                      {getButtonLabel(0, configADFSSSO.state, hasADFSSSOChangesOnStep0)}
                    </CTAButton>
                  </div>
                )}
              </div>
            </form>
          )}
      </div>
    </div>
  );
}
